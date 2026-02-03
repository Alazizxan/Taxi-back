import { ApiProperty } from '@nestjs/swagger';

export class CreateTaxiDto {
  @ApiProperty({ example: 'Chorsu bozori' })
  destinationText: string;

  @ApiProperty({ example: 5.6 })
  distanceKm: number;
}
