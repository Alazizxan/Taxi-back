import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UpdateLocationDto } from './dto/update-location.dto';

@ApiTags('Users')
@ApiBearerAuth('JWT')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my profile' })
  getMe(@CurrentUser() user) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('location')
  @ApiOperation({ summary: 'Update user location' })
  updateLocation(
    @CurrentUser() user,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.usersService.updateLocation(
      user.id,
      dto.lng,
      dto.lat,
    );
  }
}
