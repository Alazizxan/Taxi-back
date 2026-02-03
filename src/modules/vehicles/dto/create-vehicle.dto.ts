import { ApiProperty } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({ example: 'Chevrolet Cobalt' })
  model: string;

  @ApiProperty({ example: 'White' })
  color: string;

  @ApiProperty({ example: '01A123AA' })
  plateNumber: string;
}
