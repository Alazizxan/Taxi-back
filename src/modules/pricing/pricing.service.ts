import { Injectable } from '@nestjs/common';

@Injectable()
export class PricingService {
  private readonly BASE_PRICE = 5000;
  private readonly PRICE_PER_KM = 3000;
  private readonly MIN_PRICE = 10000;
  private readonly WAIT_PRICE_PER_MIN = 500;

  calculate(
    distanceKm: number,
    waitingMin: number = 0,
  ): number {
    if (distanceKm <= 0) return this.MIN_PRICE;

    const ridePrice =
      this.BASE_PRICE + distanceKm * this.PRICE_PER_KM;

    const waitPrice =
      waitingMin * this.WAIT_PRICE_PER_MIN;

    return Math.round(
      Math.max(ridePrice + waitPrice, this.MIN_PRICE),
    );
  }
}
