import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Driver } from './schemas/driver.schema';
import { Order } from '../orders/schemas/order.schema';
import { CommissionService } from '../commission/commission.service';
import { WalletService } from '../wallet/wallet.service';
import { OrdersService } from '../orders/orders.service';
import { getDistance } from 'geolib';
import { PricingService } from '../pricing/pricing.service';
import { NotificationService } from '../notifications/notification.service';






@Injectable()
export class DriversService {
  constructor(
    @InjectModel(Driver.name) private driverModel: Model<Driver>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly pricingService: PricingService,
    private commissionService: CommissionService,
    private walletService: WalletService,
    private ordersService: OrdersService,
    private notificationService: NotificationService,
  ) { }

  async acceptOrder(driverId: string, orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    if (order.status !== 'requested')
      throw new BadRequestException('Order not available');

    const driver = await this.driverModel.findById(driverId);
    if (!driver) throw new NotFoundException('Driver not found');


    if (!driver.walletBalance || driver.walletBalance <= 0) {
      // ❗ avtomatik offline qilamiz
      driver.online = false;
      await driver.save();

      throw new BadRequestException(
        'Insufficient balance. Please top up your wallet',
      );
    }

    order.driverId = driverId as any;
    order.status = 'accepted';
    await order.save();

    // 🔔 USERGA XABAR
    await this.notificationService.create({
      targetType: 'user',
      targetId: order.userId,
      type: 'ORDER_ACCEPTED',
      payload: {
        orderId: order._id.toString(),
      },
    });

    return order;

  }

  async rejectOrder(driverId: string, orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.rejectedDrivers.push(driverId);
    order.currentDriverId = null;

    await order.save();

    // 🔁 keyingi driver
    return this.ordersService.assignNextDriver(orderId);
  }


  async arrived(orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    order.status = 'arrived';
    await order.save();

    // 🔔 USERGA XABAR
    await this.notificationService.create({
      targetType: 'user',
      targetId: order.userId,
      type: 'DRIVER_ARRIVED',
      payload: {
        orderId: order._id.toString(),
      },
    });

    return order;
  }


  async started(driverId: string, orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    if (String(order.driverId) !== String(driverId))
      throw new BadRequestException('Not your order');

    if (order.status !== 'accepted')
      throw new BadRequestException('Order not accepted');

    order.status = 'started';

    // 🔥 REAL HISOB BOSHLANADI
    order.actualDistanceKm = 0;
    order.lastDriverLocation = {
      type: 'Point',
      coordinates: [
        order.pickupLocation.coordinates[0],
        order.pickupLocation.coordinates[1],
      ],
    };


    await order.save();

    await this.notificationService.create({
      targetType: 'user',
      targetId: order.userId,
      type: 'TRIP_STARTED',
      payload: {
        orderId: order._id.toString(),
      },
    });
    return order;
  }


  async finished(driverId: string, orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    if (String(order.driverId) !== String(driverId))
      throw new BadRequestException('Not your order');

    // ❗ started YOKI paused bo‘lishi mumkin
    if (!['started', 'paused'].includes(order.status))
      throw new BadRequestException('Order not in progress');

    const driver = await this.driverModel.findById(order.driverId);
    if (!driver) throw new NotFoundException('Driver not found');

    // 🔥 AGAR PAUSED HOLATDA BO‘LSA — OXIRGI KUTISHNI QO‘SHAMIZ
    if (order.status === 'paused' && order.waitingStartedAt) {
      const diffMin = Math.ceil(
        (Date.now() - order.waitingStartedAt.getTime()) / 60000,
      );
      order.waitingMinutes += diffMin;
      order.waitingStartedAt = null;
    }

    // 🔥 REAL PRICE = MASOFA + KUTISH
    const finalPrice = this.pricingService.calculate(
      order.actualDistanceKm,
      order.waitingMinutes,
    );

    const commission =
      this.commissionService.calculate(finalPrice);

    await this.walletService.debit(
      String(driver._id),
      commission,
    );

    order.status = 'finished';
    order.finalPrice = finalPrice;

    // wallet 0 bo‘lsa — offline
    if (driver.walletBalance <= 0) {
      driver.online = false;
    }

    await driver.save();
    await order.save();
    await this.notificationService.create({
      targetType: 'user',
      targetId: order.userId,
      type: 'TRIP_FINISHED',
      payload: {
        orderId: order._id.toString(),
        finalPrice,
      },
    });

    // 🔔 DRIVERGA XABAR (hisob / komissiya)
    await this.notificationService.create({
      targetType: 'driver',
      targetId: driver._id,
      type: 'EARNING_SUMMARY',
      payload: {
        orderId: order._id.toString(),
        finalPrice,
        commission,
      },
    });

    return {
      finalDistanceKm: order.actualDistanceKm,
      waitingMinutes: order.waitingMinutes,
      finalPrice,
      commission,
    };
  }



  async getOrderForDriver(driverId: string, orderId: string) {
    const order = await this.orderModel
      .findById(orderId)
      .populate('userId', 'name phone');

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (String(order.driverId) !== String(driverId)) {
      throw new ForbiddenException('This order is not assigned to you');
    }

    return {
      orderId: order._id,
      status: order.status,

      pickup: {
        lat: order.pickupLocation.coordinates[1],
        lng: order.pickupLocation.coordinates[0],
        addressText: 'Pickup location',
      },

      destination: {
        addressText: order.destinationText,
      },

      user: {
        name: (order.userId as any).name,
        phone: (order.userId as any).phone,
      },
    };
  }


  async updateLocation(
    driverId: string,
    lng: number,
    lat: number,
  ) {
    const driver = await this.driverModel.findById(driverId);
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    // 🔒 WALLET CHECK
    if (!driver.walletBalance || driver.walletBalance <= 0) {
      driver.online = false;
      await driver.save();
      throw new BadRequestException('Insufficient balance');
    }

    driver.lastSeenAt = new Date();
    driver.online = true;



    // 🔍 AKTIV SAFARNI TOPAMIZ
    const order = await this.orderModel.findOne({
      driverId: driver._id,
      status: 'started',
    });

    // 🚕 REAL MASOFA HISOBLASH
    if (order) {
      if (order.lastDriverLocation) {
        const meters = getDistance(
          {
            latitude: order.lastDriverLocation.coordinates[1],
            longitude: order.lastDriverLocation.coordinates[0],
          },
          {
            latitude: lat,
            longitude: lng,
          },
        );

        // GPS sakrashdan himoya
        if (meters < 300) {
          order.actualDistanceKm += meters / 1000;
        }
      }

      order.lastDriverLocation = {
        type: 'Point',
        coordinates: [Number(lng), Number(lat)],
      };

      await order.save();
    }

    // 📍 DRIVER LOCATION UPDATE
    driver.location = {
      type: 'Point',
      coordinates: [
        Number(lng),
        Number(lat),
      ],
    };

    driver.online = true;
    return driver.save();
  }


  async heartbeat(driverId: string) {
    const driver = await this.driverModel.findById(driverId);
    if (!driver) throw new NotFoundException('Driver not found');

    if (!driver.walletBalance || driver.walletBalance <= 0) {
      driver.online = false;
    } else {
      driver.online = true;
      driver.lastSeenAt = new Date();
    }

    await driver.save();
    return { ok: true };
  }




  private async updateStatus(orderId: string, status: string) {
    return this.orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true },
    );
  }


  async pauseOrder(driverId: string, orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    if (String(order.driverId) !== String(driverId))
      throw new BadRequestException('Not your order');

    if (order.status !== 'started')
      throw new BadRequestException('Order not started');

    order.status = 'paused';
    order.waitingStartedAt = new Date();

    return order.save();
  }



  async resumeOrder(driverId: string, orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    if (String(order.driverId) !== String(driverId))
      throw new BadRequestException('Not your order');

    if (order.status === 'paused') {
      const startedAt = order.waitingStartedAt;
      if (startedAt) {
        const diffMin = Math.ceil(
          (Date.now() - startedAt.getTime()) / 60000,
        );
        order.waitingMinutes += diffMin;
        order.waitingStartedAt = null;
      }
    }



    order.status = 'started';

    return order.save();
  }




  async getActiveOrder(driverId: string) {
    return this.orderModel.findOne({
      currentDriverId: driverId,
      status: 'requested',
    });
  }







}
