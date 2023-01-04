import { swap } from '@benzed/util'

//// Shortcuts ////

const { floor, random } = Math

//// Types ////

// Should this be public?
type MutArrayLike<T> = {
    [index: number]: T
    length: number
}

//// Main ////

/**
 * Randomly re-arranges a given array.
 *
 * @param  {Array} input ArrayLike to be sorted.
 * @return {Array} ArrayLike is mutated in place, but method returns it anyway.
 */
function shuffle<T extends ArrayLike<unknown>>(input: T): T 
function shuffle<T extends MutArrayLike<unknown>>(this: T): T 

function shuffle(this: unknown, ...args: [unknown] | []): unknown {

    const input = (args.length === 0 ? this : args[0]) as MutArrayLike<unknown>

    let index = input.length

    while (index > 0) {
        const rIndex = floor(random() * input.length)
        swap(input, rIndex, --index)
    }

    return input
}

//// Exports ////

export default shuffle
