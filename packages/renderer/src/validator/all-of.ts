/* eslint-disable @typescript-eslint/no-explicit-any */

import { Intersect } from '@benzed/util'
import { Validator } from './types'

/*** Exports ***/

export default function allOf<T extends any[]>(
    ...validators: {
        [K in keyof T]: Validator<T[K]>
    }
): Validator<Intersect<T>> {

    return (input: unknown): input is Intersect<T> => {
        for (const validator of validators) {
            if (!validator(input))
                return false
        }

        return true
    }
}

export { allOf, allOf as and }