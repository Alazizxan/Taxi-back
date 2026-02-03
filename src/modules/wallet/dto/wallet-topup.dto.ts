import { ApiProperty } from '@nestjs/swagger';

export class WalletTopUpDto {
  @ApiProperty({ example: 50000 })
  amount: number;
}
