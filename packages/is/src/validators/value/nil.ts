import { Schema, ValidationErrorMessage } from '@benzed/schema'
import { asNil, isNil, nil } from '@benzed/util'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Setup ////

class Nil extends Schema<unknown, nil> {
    constructor(error: string | ValidationErrorMessage<unknown> = 'Must be nil') {
        super({
            isValid: isNil,
            transform: asNil,
            error
        })
    }
}

//// Exports ////

export default Nil

export {
    Nil
}

export const $nil = new Nil()