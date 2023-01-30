import { 
    Primitive 
} from '@benzed/util'

import { 
    AbstractSchema,
    NameErrorIdSignature,
    toNameErrorId,
    Validate,
    ValidatorSettings,
} from '@benzed/schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Setup ////

class Value<T extends Primitive> extends AbstractSchema<unknown, T> {

    get value(): T {
        return (this._mainValidator as Validate<unknown, T> & { value: T }).value
    }

    constructor(value: T, ...args: NameErrorIdSignature<unknown>) {
        super({ 
            name: String(value),
            ...toNameErrorId(...args),
            value,
            isValid(
                this: { value: T }, 
                input: unknown
            ): boolean {
                return Object.is(input, this.value)
            }
        } as unknown as ValidatorSettings<unknown, T>)
    }

}

//// Exports ////

export default Value

export {
    Value
}