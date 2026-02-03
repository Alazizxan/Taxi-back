import { ApiProperty } from '@nestjs/swagger';

export class OrderIdParamDto {
  @ApiProperty({ example: '65fa1c9b8c8d9c0012a12345' })
  id: string;
}
