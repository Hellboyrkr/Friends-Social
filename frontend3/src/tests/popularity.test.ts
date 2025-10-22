import { computePopularity } from '../utils/popularity';
import { User } from '../types';

const makeUser = (hobbies: number, name = 'alice'): User => ({
  id: 'u1',
  username: name,
  age: 20,
  hobbies: Array.from({ length: hobbies }, (_, i) => ({ id: 'h'+i, name: 'H'+i })),
  popularityScore: 0
});

test('popularity increases with hobbies', () => {
  const a = computePopularity(makeUser(1));
  const b = computePopularity(makeUser(3));
  expect(b).toBeGreaterThan(a);
});
