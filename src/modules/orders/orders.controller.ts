import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Get,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateTaxiDto } from './dto/create-taxi.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post('taxi')
  @ApiOperation({ summary: 'Create taxi order' })
  createTaxi(
    @CurrentUser() user,
    @Body() dto: CreateTaxiDto,
  ) {
    return this.ordersService.createTaxiOrder(
      user.id,
      dto.destinationText,
      Number(dto.distanceKm),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order detail for user' })
  getOrderDetail(
    @Param('id') id: string,
    @CurrentUser() user,
  ) {
    return this.ordersService.getOrderDetailForUser(
      id,
      user.id,
    );
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (admin/debug)' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.ordersService.updateStatus(id, status);
  }
}
