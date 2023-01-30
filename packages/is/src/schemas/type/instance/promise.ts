import { 
    AbstractSchema,
    AbstractValidateWithIdNameError,
    NameErrorIdSignature,
    toNameErrorId,
    ValidateContext, 
    ValidateOptions, 
    ValidationError 
} from '@benzed/schema'

/* eslint-disable 
    @typescript-eslint/ban-types
*/

type AnyPromise = globalThis.Promise<unknown>

//// Helper ////

function validatePromise(this: ValidatePromise, input: unknown, options?: Partial<ValidateOptions>): AnyPromise {
    void options
    if (input instanceof globalThis.Promise)
        return input

    const ctx = new ValidateContext(input, options)
    throw new ValidationError(this, ctx)
}
 
class ValidatePromise extends AbstractValidateWithIdNameError<unknown, AnyPromise> {

    constructor(...args: NameErrorIdSignature<unknown>) {

        const { name = 'Promise', ...rest } = toNameErrorId(...args) ?? {}

        super(validatePromise,{ name, ...rest })
    }

    override error(): string {
        return `Must be a ${this.name}`
    }

}

//// Exports ////

class Promise extends AbstractSchema<unknown, AnyPromise> {

    constructor(...args: NameErrorIdSignature<unknown>) {
        super(new ValidatePromise(...args))
    }

}

//// Exports ////

export default Promise

export {
    Promise,
}

export const $promise = new Promise()
