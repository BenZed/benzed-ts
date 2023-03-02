
//// Shortcuts ////

import { each } from '@benzed/util'

const { splice, findIndex } = Array.prototype

//// Main ////

/**
 * Given filter arguements, return true if the provided value is
 * unique to the array, false otherwise.
 */
function unique<T>(value: T, index: number, array: ArrayLike<T>): boolean

/**
 * Given an arraylike, return an arraylike containing only unique values.
 * @param arrayLike 
 */
function unique<T extends string | ArrayLike<unknown>>(arrayLike: T): T

/**
 * Bound to an arraylike, return an arraylike containing only unique values.
 * @param this 
 */
function unique<T extends ArrayLike<unknown>>(this: T): T
function unique(
    this: unknown, 
    arrayLikeOrItem?: unknown, 
    index?: number, 
    arrayContainingItem?: ArrayLike<unknown>
): unknown {

    // handle bound signature
    if (this) 
        return unique(this as ArrayLike<unknown>)
    
    // handle filter signature
    if (arrayContainingItem) {
        const item = arrayLikeOrItem
        return findIndex.call(arrayContainingItem, value => Object.is(item, value)) === index
    }

    const arrayLike = arrayLikeOrItem as ArrayLike<unknown>

    // handle string value string
    if (typeof arrayLike === 'string')
        return unique(arrayLike.split('')).join('')

    // handle 
    for (const index of each.indexOf(arrayLike, true)) {
        if (!unique(arrayLike[index], index, arrayLike)) 
            splice.call(arrayLike, index, 1)
    }

    return arrayLike
}

//// Exports ////

export default unique