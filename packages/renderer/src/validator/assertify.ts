import { Asserter, Validator } from './types'

/*** Main ***/

function assertify<T>(validator: Validator<T>, msg = 'Incorrect type'): Asserter<T> {
    return (input: unknown) => {
        if (!validator(input))
            throw new Error(msg)
    }
}

/*** Exports ***/

export default assertify

export {
    assertify
}