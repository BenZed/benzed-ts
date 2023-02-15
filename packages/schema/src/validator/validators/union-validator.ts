import { assign } from '@benzed/util'

import { ValidateInput, ValidateOptions, ValidateOutput } from '../../validate'
import { ValidationContext } from '../../validation-context'
import { ValidationError } from '../../validation-error'
import { $$clone, AnyValidateStruct } from '../validate-struct'
import { $$target, ValidatorProxy } from '../validator-proxy'
import { LastValidator, ValidatorArray } from './transform-validator'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Symbols ////

const $$unionOptions = Symbol('proxy-non-target-union-options')

//// HelperTypes ////

type _UnionValidatorWrapBuilderOutput<V extends ValidatorArray, P> = 
    P extends LastValidator<V>
        ? UnionValidator<V>
        : P extends (...args: infer A) => LastValidator<V>
            ? (...args: A) => UnionValidator<V> 
            : P

type _UnionValidatorProperties<V extends ValidatorArray> = {
    [K in keyof LastValidator<V>]: _UnionValidatorWrapBuilderOutput<V, LastValidator<V>[K]>
} & {
    readonly validators: V
}

//// Types ////

type UnionValidatorInput<V extends ValidatorArray> = ValidateInput<V[number]>

type UnionValidatorOutput<V extends ValidatorArray> = 
    ValidateOutput<V[number]> extends UnionValidatorInput<V>
        ? ValidateOutput<V[number]>
        : never

type UnionValidator<V extends ValidatorArray> = 
    ValidatorProxy<LastValidator<V>, ValidateInput<V[number]>, UnionValidatorOutput<V>> 
    & _UnionValidatorProperties<V>

interface UnionValidatorConstructor {
    new <V extends ValidatorArray>(...validators: V): UnionValidator<V>
}

//// Main ////

const UnionValidator = class UnionValidator extends ValidatorProxy<any,any,any> {

    // Construct

    constructor(...validators: AnyValidateStruct[]) {
        const [ target, ...nonTarget ] = validators.reverse()
        super(target)
        this[$$unionOptions] = nonTarget.reverse()
    }

    protected readonly [$$unionOptions]: ValidatorArray

    get validators(): ValidatorArray {
        return [
            ...this[$$unionOptions],
            this[$$target]
        ]
    }

    // Validate
    validate(input: any, options?: ValidateOptions | undefined): any {
        const ctx = new ValidationContext(input, options)
        
        const errors: ValidationError<unknown>[] = []
        for (const validator of this.validators) {
            try {
                return validator(input, ctx)
            } catch (e) {
                if (!ValidationError.is(e)) {
                    console.log(e)
                    throw e
                }
                errors.push(e)
            }
        }

        throw new ValidationError(this, ctx)
    }

    // Settings 

    protected override [$$clone](): this {
        const clone = super[$$clone]()
        assign(clone, { [$$unionOptions]: [...this[$$unionOptions]] })
        return clone
    }

} as unknown as UnionValidatorConstructor

//// Exports ////

export default UnionValidator

export {
    UnionValidator
}
