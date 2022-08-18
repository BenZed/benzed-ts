import { isNumber } from '@benzed/is'

/*** Main ***/

function resolveIndex(
    arrLikeOrLength: number | ArrayLike<unknown>,
    index: number
): number {

    const length = isNumber(arrLikeOrLength)
        ? arrLikeOrLength
        : arrLikeOrLength.length

    if (length < 0)
        throw new Error(`Provided length (${length}) cannot be below 0.`)

    return (index % length + length) % length || 0 // <- in case of NaN, which only
    //                                       happens if the array is empty in which 
    //                                       case the only valid index is 0, anyway
}

/*** Exports ***/

export default resolveIndex