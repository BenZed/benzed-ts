import { each } from '../each'
import { isNil, nil } from './nil'

//// Type ////

type Defined<T extends object> = {
    [K in keyof T as T[K] extends undefined ? never : K]: T[K]
}

//// Main ////

/**
 * Get a shallow copy of the input object that only contains
 * defined keys
 */
function defined<T extends object>(input: T): Defined<T> {
    const output = {} as T
    for (const key of each.keyOf(input)) {
        if (input[key] !== nil)
            output[key] = input[key]
    }

    return output as Defined<T>
}

const isDefined = <T>(input: T): input is Exclude<T, nil> => !isNil(input)

//// Exports ////

export default defined

export {
    defined,
    isDefined,
    Defined
}