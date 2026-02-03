import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@ApiTags('Vehicles')
@ApiBearerAuth('JWT')
@Controller('vehicles')
@UseGuards(JwtAuthGuard, new RolesGuard('driver'))
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ApiOperation({ summary: 'Create vehicle' })
  create(
    @CurrentUser() driver,
    @Body() dto: CreateVehicleDto,
  ) {
    return this.vehiclesService.create(driver.id, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my vehicle' })
  getMyVehicle(@CurrentUser() driver) {
    return this.vehiclesService.getByDriver(driver.id);
  }
}
