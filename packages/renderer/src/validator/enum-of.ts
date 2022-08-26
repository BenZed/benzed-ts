import { Validator } from './types'

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Exports ***/

export default function enumOf<T extends readonly (string | number | symbol | boolean)[]>(
    ...options: T
): Validator<T[number]> {
    return (input: unknown): input is T[number] =>
        options.includes(input as T[number])
}

export { enumOf, enumOf as literal }

