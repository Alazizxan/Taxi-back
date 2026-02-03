import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Headers,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  // 🔐 BOT + APP uchun oddiy himoya
  private checkSecret(secret?: string) {
    if (!secret || secret !== process.env.CLIENT_SECRET) {
      throw new UnauthorizedException('Invalid client key');
    }
  }

  /**
   * 🤖 Telegram Bot / 📱 Mobile App
   * Foydalanuvchi yoki driver uchun pending notificationlar
   *
   * GET /notifications/pending?targetType=user&targetId=xxx
   */
  @Get('pending')
  async getPending(
    @Query('targetType') targetType: 'user' | 'driver',
    @Query('targetId') targetId: string,
    @Headers('x-client-key') secret: string,
  ) {
    this.checkSecret(secret);

    if (!targetType || !targetId) {
      throw new BadRequestException(
        'targetType and targetId are required',
      );
    }

    return this.notificationService.getForTarget(
      targetType,
      targetId,
    );
  }

  /**
   * ✅ Notification clientga yetkazildi
   *
   * POST /notifications/:id/delivered
   */
  @Post(':id/delivered')
  async delivered(
    @Param('id') id: string,
    @Headers('x-client-key') secret: string,
  ) {
    this.checkSecret(secret);

    return this.notificationService.markDelivered(id);
  }
}
