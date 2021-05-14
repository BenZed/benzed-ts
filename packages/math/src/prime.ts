
/*** Main ***/

/**
 * Determines if a number is prime.
 *
 * @param  {number} value Value to test.
 * @return {boolean}      True if value is prime, false otherwise.
 */
function isPrime(value: number): boolean {

  for (let i = 2; i < value; i++)
    if (value % i === 0)
      return false

  return value > 1

}

/**
 * Iterates each prime between the min and max values.
 * If two values are provided, they will be treated as the min/max.
 * If one value is provided, it will be treated as the max, and 0 will be
 * used as the min.
 * @param args
 */
function* primes(...args: [max: number] | [min: number, max: number]): Iterable<number> {

  let min, max

  // If a single argument is provided, it is the max
  if (args.length === 1) {
    ([max] = args)
    min = 2

    // Otherwise we try to get the min and the max
  } else
    ([min, max] = args)

  // TODO validation? min and max should be positive integers, max should be below min.

  for (let i = min; i < max; i++)
    if (isPrime(i))
      yield i

}

/******************************************************************************/
// Exports
/******************************************************************************/

export { isPrime, primes }
