
import copy from '../copy'
import equals from '../equals'

import { descending } from '@benzed/array'

/*** Shortcuts ***/

const { splice } = Array.prototype

/*** Main ***/

/**
 * Immutably uniquify an ArrayLike.
 * 
 * @returns A clone of the input without any duplicate values.
 */
export default function unique<T extends string | ArrayLike<unknown>>(input: T): typeof input {

    if (typeof input === `string`) {

        let output = ``
        for (const char of input) {
            if (!output.includes(char))
                output += char
        }

        return output as T

    } else {

        const output = copy(input)
        const outputSplice = splice.bind(output)

        const indexesToDelete: number[] = []

        for (let i = 0; i < output.length; i++) {
            if (indexesToDelete.includes(i))
                continue

            for (let ii = i + 1; ii < output.length; ii++) {
                if (equals(output[ii], output[i]))
                    indexesToDelete.push(ii)
            }
        }

        indexesToDelete.sort(descending)

        for (const indexToDelete of indexesToDelete)
            outputSplice(indexToDelete, 1)

        return output
    }
}

export { unique }