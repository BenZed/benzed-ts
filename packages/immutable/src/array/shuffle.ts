
import copy from '../copy'
import { shuffle as _shuffle } from '@benzed/array'

//// Main ////

/**
 * Immutably shuffle an ArrayLike.
 * 
 * @returns A clone of the input where each item is at a randomized index.
 */
export default function shuffle<T extends ArrayLike<unknown>>(input: T): typeof input {
    const output = copy(input)

    return _shuffle(output)
}

export { shuffle }