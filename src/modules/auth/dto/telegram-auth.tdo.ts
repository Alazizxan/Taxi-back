import { ApiProperty } from '@nestjs/swagger';

export class TelegramAuthDto {
  @ApiProperty({ example: '123456789' })
  telegramId: number;

  @ApiProperty({ example: 'Ali' })
  name: string;

  @ApiProperty({ example: '+998901234567' })
  phone: string;
}
