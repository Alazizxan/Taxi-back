import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WalletTopUpDto } from './dto/wallet-topup.dto';

@ApiTags('Wallet')
@ApiBearerAuth('JWT')
@Controller('wallet')
@UseGuards(JwtAuthGuard, new RolesGuard('driver'))
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('topup')
  @ApiOperation({ summary: 'Top up wallet' })
  topUp(
    @CurrentUser() driver,
    @Body() dto: WalletTopUpDto,
  ) {
    return this.walletService.topUp(
      driver.id,
      dto.amount,
    );
  }

  @Get('me')
  @ApiOperation({ summary: 'Get wallet balance' })
  getMyWallet(@CurrentUser() driver) {
    return this.walletService.getBalance(driver.id);
  }
}
