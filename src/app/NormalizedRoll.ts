import { Brand } from 'effect';
import { NormalizedPrice } from './NormalizedPrice';
import { Roll } from './Roll';

export type NormalizedRoll = number & Brand.Brand<'NormalizedRoll'>;

export const NormalizedRoll = Brand.refined<NormalizedRoll>(
  (n) => Number.isFinite(n),
  (n) => {
    throw new Error(`Normalized roll value must be a finite number ⇒ "${n}"`);
  }
);

export function getNormalizedRoll(roll: Roll, price: NormalizedPrice): NormalizedRoll {
  return NormalizedRoll(roll / price);
}
