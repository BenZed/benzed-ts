import { isIterable } from '@benzed/util'

//// Shortcut ////

const { random: _random, floor } = Math

//// Helper ////

function randomIndex(input: ArrayLike<unknown>): number {
    return floor(_random() * input.length)
}

//// Main ////

/**
 * Returns a random element from an ArrayLike or Iterable
 * @param input 
 */
function random<T>(input: ArrayLike<T> | Iterable<T>): T 
function random<T>(this: ArrayLike<T> | Iterable<T>): T 

function random(this: unknown, ...args: [unknown] | []): unknown {

    const input = args.length === 0 ? this : args[0]

    const arrayLike = (isIterable(input) ? [...input] : input) as ArrayLike<unknown>

    const rIndex = randomIndex(arrayLike)

    return arrayLike[rIndex]
}

//// Exports ////

export default random
