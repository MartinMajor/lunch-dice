import { Brand } from 'effect';

export type Roll = number & Brand.Brand<'Roll'>;

export const Roll = Brand.refined<Roll>(
  (n) => Number.isFinite(n),
  () => {
    throw new Error('Rolled value must be a finite number');
  }
);
