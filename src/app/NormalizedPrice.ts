import { Brand } from 'effect';

export type NormalizedPrice = number & Brand.Brand<'NormalizedPrice'>;

export const NormalizedPrice = Brand.refined<NormalizedPrice>(
  (n) => Number.isFinite(n),
  () => {
    throw new Error('Normalized price must be a finite number');
  }
);
