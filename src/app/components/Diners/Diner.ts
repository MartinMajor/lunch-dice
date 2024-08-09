import { NormalizedPrice } from '@/app/NormalizedPrice';
import { Price } from '@/app/Price';
import { Roll } from '@/app/Roll';
import { type DinerId } from './DinerId';

export type Diner = {
  id: DinerId;
  emoji: string | null;
  name: string | null;
  price: Price | null;
  normalizedPrice: NormalizedPrice | null;
  rolled: Roll | null;
};
