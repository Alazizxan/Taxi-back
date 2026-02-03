import {
  Controller,
  Patch,
  Post,
  Body,
  Param,
  UseGuards,
  Get,
} from '@nestjs/common';
import { DriversService } from './drivers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { UpdateDriverLocationDto } from './dto/update-driver-location.dto';
import { OrderIdParamDto } from './dto/order-id.pram.dto';

@ApiTags('Drivers')
@ApiBearerAuth()
@Controller('drivers')
@UseGuards(JwtAuthGuard)
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Patch('orders/:id/accept')
  @ApiOperation({ summary: 'Accept order' })
  accept(
    @CurrentUser() driver,
    @Param() params: OrderIdParamDto,
  ) {
    return this.driversService.acceptOrder(driver.id, params.id);
  }

  @Patch('orders/:id/arrived')
  @ApiOperation({ summary: 'Driver arrived to pickup point' })
  arrived(@Param() params: OrderIdParamDto) {
    return this.driversService.arrived(params.id);
  }

  @Patch('orders/:id/started')
  @ApiOperation({ summary: 'Start trip' })
  started(
    @Param() params: OrderIdParamDto,
    @CurrentUser() driver,
  ) {
    return this.driversService.started(driver.id, params.id);
  }

  @Patch('orders/:id/finished')
  @ApiOperation({ summary: 'Finish trip' })
  finished(
    @Param() params: OrderIdParamDto,
    @CurrentUser() driver,
  ) {
    return this.driversService.finished(driver.id, params.id);
  }

  @Post('heartbeat')
  @ApiOperation({ summary: 'Driver heartbeat (online keep-alive)' })
  heartbeat(@CurrentUser() driver) {
    return this.driversService.heartbeat(driver.id);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order detail for driver' })
  getOrder(
    @CurrentUser() driver,
    @Param() params: OrderIdParamDto,
  ) {
    return this.driversService.getOrderForDriver(
      driver.id,
      params.id,
    );
  }

  @Patch('location')
  @ApiOperation({ summary: 'Update driver location' })
  updateLocation(
    @CurrentUser() driver,
    @Body() dto: UpdateDriverLocationDto,
  ) {
    return this.driversService.updateLocation(
      driver.id,
      dto.lng,
      dto.lat,
    );
  }

  @Patch('orders/:id/reject')
  @ApiOperation({ summary: 'Reject order' })
  rejectOrder(
    @CurrentUser() driver,
    @Param() params: OrderIdParamDto,
  ) {
    return this.driversService.rejectOrder(
      driver.id,
      params.id,
    );
  }

  @Get('orders/active')
  @ApiOperation({ summary: 'Get active order for driver' })
  getActiveOrder(@CurrentUser() driver) {
    return this.driversService.getActiveOrder(driver.id);
  }

  @Patch('orders/:id/pause')
  @ApiOperation({ summary: 'Pause trip (waiting)' })
  pause(
    @CurrentUser() driver,
    @Param() params: OrderIdParamDto,
  ) {
    return this.driversService.pauseOrder(driver.id, params.id);
  }

  @Patch('orders/:id/resume')
  @ApiOperation({ summary: 'Resume trip after pause' })
  resume(
    @CurrentUser() driver,
    @Param() params: OrderIdParamDto,
  ) {
    return this.driversService.resumeOrder(driver.id, params.id);
  }
}
