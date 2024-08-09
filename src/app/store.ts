import { atom } from 'jotai';
import { Price } from './Price';
import { Roll } from './Roll';
import type { Diner } from './components/Diners/Diner';
import { createDinerId } from './components/Diners/DinerId';

export function createDiner() {
  return {
    id: createDinerId(),
    emoji: null,
    name: null,
    price: null,
    normalizedPrice: null,
    rolled: null,
  } satisfies Diner;
}

export const dinersAtom = atom<readonly Diner[]>([]);
