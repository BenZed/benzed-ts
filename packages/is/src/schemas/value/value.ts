import { isSymbol, Primitive } from '@benzed/util'
import { Schema, ValidationErrorMessage } from '@benzed/schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Setup ////

class Value<T extends Primitive> extends Schema<unknown, T> {

    constructor(readonly value: T, error?: string | ValidationErrorMessage<unknown>) {

        const name = isSymbol(value) 
            ? 'uniqueSymbol' 
            : value?.toString() ?? 'undefined'
        
        super({

            name,

            error,

            // @ts-expect-error it's fine
            isValid(
                this: Value<T>, 
                input: unknown
            ): input is T {
                return Object.is(input, this.value)
            }
        }) 

        this.value = value
    }

}

//// Exports ////

export default Value

export {
    Value
}