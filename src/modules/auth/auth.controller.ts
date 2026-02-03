import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterDriverDto } from './dto/register-driver.dto';
import { TelegramAuthDto } from './dto/telegram-auth.tdo';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('user/register')
  @ApiOperation({ summary: 'User register (Telegram / Bot)' })
  registerUser(@Body() dto: RegisterUserDto) {
    return this.authService.registerUser(dto);
  }

  @Post('user/login')
  @ApiOperation({ summary: 'User login' })
  loginUser(@Body() dto: LoginUserDto) {
    return this.authService.loginUser(dto.phone, dto.password);
  }

  @Post('driver/register')
  @ApiOperation({ summary: 'Driver register (Mobile App)' })
  registerDriver(@Body() dto: RegisterDriverDto) {
    return this.authService.registerDriver(dto);
  }

  @Post('driver/login')
  @ApiOperation({ summary: 'Driver login (Mobile App)' })
  loginDriver(@Body() dto: LoginUserDto) {
    return this.authService.loginDriver(dto.phone, dto.password);
  }

  @Post('telegram')
  @ApiOperation({ summary: 'Telegram auth (passwordsiz)' })
  telegramAuth(@Body() dto: TelegramAuthDto) {
    return this.authService.telegramAuth(dto);
  }
}
