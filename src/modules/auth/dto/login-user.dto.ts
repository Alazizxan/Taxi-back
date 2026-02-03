import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ example: '+998901234567' })
  phone: string;

  @ApiProperty({ example: '123456' })
  password: string;
}
