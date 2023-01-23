import { isSymbol, nil, Primitive } from '@benzed/util'
import { capitalize } from '@benzed/string'

import { Validate, ValidateOptions } from '../../validate'
import { ValidationError, ValidationErrorMessage } from '../../error'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Validator ////

function isValue<T extends Primitive>(
    this: Value<T>, 
    input: unknown, 
    options?: ValidateOptions
): T {

    if (options?.transform && input === nil)
        input = this.value

    if (!Object.is(input, this.value))
        ValidationError.throw(this, this.error)

    return input as T
}

//// Setup ////

class Value<T extends Primitive> extends Validate<unknown, T> {

    override readonly name: string

    readonly error: string | ValidationErrorMessage<unknown>

    constructor(readonly value: T, error?: string | ValidationErrorMessage<unknown>) {
        super(isValue)
        
        const name = isSymbol(this.value) ? 'uniqueSymbol' : this.value?.toString() ?? 'undefined'

        this.value = value
        this.name = `is${capitalize(name)}`
        this.error = error ?? `Must be ${name}`
    }

}

//// Exports ////

export default Value

export {
    Value
}