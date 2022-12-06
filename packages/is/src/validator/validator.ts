import { equals, extend } from '@benzed/immutable'
import { Empty, isFunction, Merge } from '@benzed/util'

import { ValidationError } from './error'
import { ValidateContext, ValidateOptions } from './context'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

interface ErrorMessage<T> {

    (value: T, ctx: ValidateContext<T>): string

}

interface Validate<I, O extends I> {
    (input: I, ctx?: ValidateOptions): O
}

interface ValidatorSettings<I, O extends I> {

    error?: string | ErrorMessage<I>

    assert?: 
    ((input: I, ctx: ValidateContext<I>) => input is O) | 
    ((input: I, ctx: ValidateContext<I>) => boolean)

    transform?: (input: I, ctx: ValidateContext<I>) => I | O

}

interface Validator<I, O extends I> extends Validate<I, O>, ValidatorSettings<I, O> {}

type _SettingExtensions<V extends ValidatorSettings<any, any>> = Merge<[Omit<V, 'error' | 'assert' | 'transform'>]>

type _ValidatorFromSettings<V extends ValidatorSettings<any,any>> = V extends ValidatorSettings<infer I, infer O> 
    ? Validator<I,O>
    : unknown

type ValidatorExtended<V extends ValidatorSettings<any, any>> = Empty extends _SettingExtensions<V> 
    ? _ValidatorFromSettings<V>
    : _ValidatorFromSettings<V> & _SettingExtensions<V>
    
//// Validate ////

function validate(

    this: ValidatorSettings<unknown, unknown>, 
    input: unknown, 
    options?: ValidateOptions
    
): unknown {

    const ctx = {
        transform: true,
        path: [],
        input,
        ...options,
    }

    const transformed = (ctx.transform || !this.assert) && this.transform 
        ? this.transform(input, ctx) 
        : input 

    const output = ctx.transform 
        ? transformed 
        : input 

    const isValid = this.assert 
        ? this.assert(output, ctx) 
        : equals(transformed, output)
    
    if (!isValid) {
        const msg = isFunction(this.error)
            ? this.error(output, ctx) 
            : this.error ?? 'Validation failed.'
        
        throw new ValidationError(output, ctx, msg)
    }

    return output
}

//// Main ////

interface ValidatorConstructor {
    new <V extends Validate<unknown, any>>(validator: V): V
    new <S extends ValidatorSettings<unknown, any>>(settings: S): ValidatorExtended<S>
    new <I, O extends I = I>(settings: ValidatorSettings<I, O>): Validator<I, O> 
}

const Validator = function validator(
    validatorOrSettings: Validate<unknown, unknown> | ValidatorSettings<unknown, unknown>
): Validator<unknown, unknown> {
    return extend(validate, validatorOrSettings)
} as unknown as ValidatorConstructor

//// Exports ////

export default Validator 

export {

    Validate,
    Validator,
    ValidatorSettings,

    ValidateOptions,
    ValidateContext,

}