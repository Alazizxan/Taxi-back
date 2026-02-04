import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Order } from './schemas/order.schema';
import { User } from '../users/schemas/user.schema';
import { Driver } from '../drivers/schemas/driver.schema';
import { PricingService } from '../pricing/pricing.service';
import { Vehicle, } from '../vehicles/schemas/vehicle.schema';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly pricingService: PricingService,
    private readonly notificationService: NotificationService,
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Driver.name)
    private readonly driverModel: Model<Driver>,
    @InjectModel(Vehicle.name)
    private readonly vehicleModel: Model<Vehicle>,

  ) { }

  /**
   * USER → Taxi order create
   * - pickup = user.lastLocation
   * - driver bu bosqichda BIRIKTIRILMAYDI
   */
  async createTaxiOrder(
    userId: string,
    destinationText: string,
    distanceKm: number,
  ) {
    // 1️⃣ User tekshiramiz
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.lastLocation) {
      throw new BadRequestException('User location not set');
    }

    if (!distanceKm || distanceKm <= 0) {
      throw new BadRequestException('Invalid distance');
    }

    // 2️⃣ Pricing
    const estimatedPrice =
      this.pricingService.calculate(distanceKm);

    const estimatedTimeMin = Math.ceil(distanceKm * 3);

    // 3️⃣ Atrofda driver bormi — faqat TEKSHIRUV
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const nearbyDriver = await this.driverModel.findOne({
      walletBalance: { $gt: 0 },
      online: true,
      lastSeenAt: { $gte: fiveMinutesAgo },
      location: {
        $near: {
          $geometry: user.lastLocation,
          $maxDistance: 3000,
        },
      },
    });


    if (!nearbyDriver) {
      throw new NotFoundException('No nearby drivers');
    }

    // 4️⃣ Order yaratamiz (driverId YO‘Q)
    const order = await this.orderModel.create({
      userId: user._id,
      pickupLocation: user.lastLocation,
      destinationText,
      estimatedPrice,
      estimatedTimeMin,
      status: 'requested',
    });

    // 🔥 BIRINCHI DRIVERGA YUBORAMIZ
    await this.assignNextDriver(order._id.toString());

    return order;

  }


  async getOrderDetailForUser(
    orderId: string,
    userId: string,
  ) {
    const order = await this.orderModel
      .findById(orderId)
      .populate('driverId', 'name phone')
      .lean();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (String(order.userId) !== String(userId)) {
      throw new BadRequestException('Access denied');
    }

    let vehicle: Vehicle | null = null;

    if (order.driverId) {
      vehicle = await this.vehicleModel.findOne({
        driverId: order.driverId,
      }) as Vehicle | null;
    }

    return {
      orderId: order._id,
      status: order.status,

      estimatedPrice: order.estimatedPrice,
      estimatedTimeMin: order.estimatedTimeMin,

      driver: order.driverId
        ? {
          name: (order.driverId as any).name,
          phone: (order.driverId as any).phone,
        }
        : null,

      vehicle: vehicle
        ? {
          model: vehicle.model,
          color: vehicle.color,
          plateNumber: vehicle.plateNumber,
        }
        : null,
    };
  }


  /**
   * ADMIN / INTERNAL
   * Status update (debug / admin uchun)
   */
  async updateStatus(orderId: string, status: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = status;
    return order.save();
  }


  async assignNextDriver(orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Agar driver allaqachon qabul qilgan bo‘lsa
    if (order.status !== 'requested' || order.currentDriverId) {
      return order;
    }

    const drivers = await this.driverModel.find({
      online: true,
      walletBalance: { $gt: 0 },
      _id: { $nin: order.rejectedDrivers },
      location: {
        $near: {
          $geometry: order.pickupLocation,
          $maxDistance: 3000,
        },
      },
    }).limit(1);

    if (!drivers.length) {
      order.status = 'no_drivers';
      order.currentDriverId = null;
      order.offerExpiresAt = null;
      return order.save();
    }
    await this.notificationService.create({
      targetType: 'user',
      targetId: order.userId,
      type: 'NO_DRIVERS_AVAILABLE',
    });


    const driver = drivers[0];

    // 🔥 driverga taklif qilamiz
    order.currentDriverId = driver._id;
    order.offerExpiresAt = new Date(Date.now() + 15_000); // 15 soniya
    await order.save();
    await this.notificationService.create({
      targetType: 'driver',
      targetId: driver._id,
      type: 'NEW_ORDER',
      payload: {
        orderId: order._id.toString(),
        estimatedPrice: order.estimatedPrice,
        estimatedTimeMin: order.estimatedTimeMin,
        destinationText: order.destinationText,
      },
    });



    // ⏱ TIMEOUT
    setTimeout(async () => {
      const freshOrder = await this.orderModel.findById(orderId);
      if (!freshOrder) return;

      // Agar shu driver hali ham javob bermagan bo‘lsa
      if (
        freshOrder.status === 'requested' &&
        freshOrder.currentDriverId?.equals(driver._id)
      ) {
        freshOrder.rejectedDrivers.push(String(driver._id));
        freshOrder.currentDriverId = null;
        freshOrder.offerExpiresAt = null;
        await freshOrder.save();

        // 🔁 keyingi driverga o‘tamiz
        await this.notificationService.create({
          targetType: 'driver',
          targetId: driver._id,
          type: 'ORDER_TIMEOUT',
          payload: {
            orderId: order._id.toString(),
          },
        });


        await this.assignNextDriver(orderId);
      }
    }, 50_000);

    return order;
  }






}
