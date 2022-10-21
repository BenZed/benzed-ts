import { descending } from './sorted-array'

/*** Shortcuts ***/

const { splice } = Array.prototype

/*** Main ***/

/**
 * Removes all duplicate values in a given array.
 *
 * @param  {Array} input ArrayLike to be uniquified
 * @return {Array} ArrayLike is mutated in place, but method returns it anyway.
 */
function unique<T extends string | ArrayLike<unknown>>(
    arrayLike: T
): T {

    if (typeof arrayLike === `string`) {

        let output = ``
        for (const char of arrayLike) {
            if (!output.includes(char))
                output += char
        }

        return output as T

    } else {

        const indexesToDelete: number[] = []
        const arraySplice = splice.bind(arrayLike)

        for (let i = 0; i < arrayLike.length; i++) {
            if (indexesToDelete.includes(i))
                continue
            for (let ii = i + 1; ii < arrayLike.length; ii++) {
                if (Object.is(arrayLike[ii], arrayLike[i]))
                    indexesToDelete.push(ii)
            }
        }

        for (const indexToDelete of indexesToDelete.sort(descending))
            arraySplice(indexToDelete, 1)

        return arrayLike
    }
}

/*** Exports ***/

export default unique