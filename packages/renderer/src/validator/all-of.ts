
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Validator } from './types'

/*** Type ***/

type Intersect<T extends any[]> = T extends [infer A, ...infer B] ? A & Intersect<B> : unknown

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