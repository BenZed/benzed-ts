import { isPrime, primes } from './prime'

/* global describe it */

describe('isPrime($value)', () => {

  it('returns true if a number is prime, false otherwise', () => {

    const primes = [2, 3, 5, 7, 11, 13, 17]
    const subs = [1, 4, 6, 8, 9, 10, 12, 14, 15, 16]

    for (const prime of primes)
      expect(isPrime(prime)).toBeTruthy()

    for (const sub of subs)
      expect(isPrime(sub)).toBeFalsy()

  })

})

describe('*primes($max) -or- *primes($min, $max)', () => {

  it('generates primes: for (const prime of primes(20))', () => {
    for (const prime of primes(20))
      expect(isPrime(prime)).toBeTruthy()
  })

  it('spreads into an array: [...primes(500,1000)]', () => {
    const arr = [...primes(500, 1000)]
    expect(arr).toHaveLength(73)
  })

})
