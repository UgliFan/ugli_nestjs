import { RANDOM_DICTIONARY } from '@app/constants/value.constant';

export function randomVerifyCode(len: number = 6) {
  if (len > RANDOM_DICTIONARY.length) {
    throw 'Verify code generate failed: to long for len.';
  }
  const pool = RANDOM_DICTIONARY.slice();
  const chars = Array(len)
    .fill(0)
    .map(() => {
      const randomIndex = Math.floor(Math.random() * pool.length);
      const res = pool.splice(randomIndex, 1);
      return res[0];
    });
  return chars.join('');
}
