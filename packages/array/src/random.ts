import isIterable from './is-iterable'

/*** Shortcut ***/

const { random: _random, floor } = Math

/*** Main ***/

/**
 * Returns a random element from an ArrayLike or Iterable
 * @param input 
 */
function random<T>(input: ArrayLike<T> | Iterable<T>): T {

  if (isIterable(input))
    input = [...input] as ArrayLike<T>

  const rIndex = floor(_random() * input.length)

  return input[rIndex]
}

/*** Exports ***/

export default random
