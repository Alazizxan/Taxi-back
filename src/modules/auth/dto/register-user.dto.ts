import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ example: 'Ali' })
  name: string;

  @ApiProperty({ example: '+998901234567' })
  phone: string;

  @ApiProperty({ example: '123456789' })
  telegramId: number;
}
