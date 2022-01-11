import { assertDefined } from '@benzed/util'

/**
 * Returns the first element of an ArrayLike.
 * @param arrayLike 
 */
function first<T>(
    arrayLike: ArrayLike<T>
): ArrayLike<T> extends [infer FirstT, ...unknown[]] ? FirstT : T | undefined {

    return arrayLike[0]
}

/*** Exports ***/

first.assert = assertDefined(first)

export default first