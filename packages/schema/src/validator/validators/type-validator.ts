import { $$state } from '@benzed/immutable'
import { assign, nil } from '@benzed/util'
import ValidationContext from '../../validation-context'
import ContractValidator from '../contract-validator'

//// Implementation ////

type TypeValidatorState<T> = { 
    default: TypeValidator<T>['default']
    cast: TypeValidator<T>['cast']
}

/**
 * Type validator is a ContractValidator that validates unknown values, 
 * with some sensible default transformation options.
 */
abstract class TypeValidator<T> extends ContractValidator<unknown, T> {

    get [$$state](): TypeValidatorState<T> {
        return {
            default: this.default,
            cast: this.cast
        }
    }

    set [$$state](value: TypeValidatorState<T>) {
        assign(this, value)
    }

    override get name(): string {
        return this.constructor.name.replace('Validator', '')
    }

    abstract override isValid(
        value: unknown, 
        context: ValidationContext<unknown>
    ): value is T

    override transform(input: unknown, ctx: ValidationContext<unknown>): unknown {
        if (input === nil)
            input = this.default(ctx)

        if (!this.isValid(input, ctx))
            input = this.cast(input, ctx)

        return input
    }

    override message(): string {
        return `Must be a ${this.name}`
    }

    /**
     * If the given input is undefined, the default 
     * method can be overridden to provide 
     */
    default(ctx: ValidationContext<unknown>): unknown {
        void ctx
        return nil
    }
    
    /**
     * If the given input is not valid, the cast method
     * may be overridden to attempt to convert it.
     * This is the classic responsibility of the transform 
     * method, but in a type validator it's been
     * split into two parts to make it easy to customize
     */
    cast(input: unknown, ctx: ValidationContext<unknown>): unknown {
        void ctx
        return input
    }

}

//// Exports ////

export default TypeValidator

export { 
    TypeValidator
}