import { 
    Primitive 
} from '@benzed/util'

import { 
    AbstractSchema,
    NameErrorIdSignature,
    toNameErrorId,
    ValidatorSettings,
} from '@benzed/schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Setup ////

class Value<T extends Primitive> extends AbstractSchema<unknown, T> {

    constructor(readonly value: T, ...args: NameErrorIdSignature<unknown>) {
        super({
            ...toNameErrorId(...args),
            isValid(
                this: Value<T>, 
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