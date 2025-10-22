import { User } from '../types';

// Example local popularity formula: hobbies count + number of vowels in username / 3
export function computePopularity(u: User): number {
  const vowels = (u.username.match(/[aeiou]/gi) || []).length;
  return Math.round((u.hobbies.length + vowels / 3) * 10) / 10;
}
