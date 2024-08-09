import { Brand } from 'effect';

export type Price = number & Brand.Brand<'Price'>;

export const Price = Brand.refined<Price>(
  (n) => Number.isFinite(n),
  () => {
    throw new Error('Price must be a finite number');
  }
);
