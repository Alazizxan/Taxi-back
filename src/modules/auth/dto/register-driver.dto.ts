import { ApiProperty } from '@nestjs/swagger';

export class RegisterDriverDto {
  @ApiProperty({ example: 'Driver 1' })
  name: string;

  @ApiProperty({ example: '+998911111111' })
  phone: string;

  @ApiProperty({ example: '123456' })
  password: string;
}
