import { ApiProperty } from '@nestjs/swagger';

export class UpdateDriverLocationDto {
  @ApiProperty({ example: 69.2401 })
  lng: number;

  @ApiProperty({ example: 41.2995 })
  lat: number;
}
