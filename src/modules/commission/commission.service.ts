import { Injectable } from '@nestjs/common';

@Injectable()
export class CommissionService {
  // MVP: 10% komissiya
  calculate(amount: number): number {
    return Math.round(amount * 0.1);
  }
}
