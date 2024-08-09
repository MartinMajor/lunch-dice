import { Brand } from 'effect';

export type DinerId = number & Brand.Brand<'DinerId'>;

export const DinerId = Brand.nominal<DinerId>();

function* createIdGenerator() {
  // TODO: Potencialy unsafe because Number.MAX_SAFE_INTEGER. Use a better way to generate unique ids.
  let id = 0;

  while (true) {
    yield DinerId(id);
    id++;
  }

  return DinerId(id); // Weird hack how to make TypeScript happy. This line will never be executed. TODO: Needs to be refactored.
}

const idGenerator = createIdGenerator();

export function createDinerId() {
  return idGenerator.next().value;
}
