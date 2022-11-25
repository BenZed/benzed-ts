import { equals, extendable } from '@benzed/immutable'
import { Empty, Merge } from '@benzed/util'

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

const validate = extendable(function validate(

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
        const msg = typeof this.error === 'function' 
            ? this.error(output, ctx) 
            : this.error ?? 'Validation failed.'
        
        throw new ValidationError(output, ctx, msg)
    }

    return output
})

//// Main ////

function validator<V extends ValidatorSettings<unknown, any>>(settings: V): ValidatorExtended<V>

function validator<I, O extends I>(settings: ValidatorSettings<I, O>): Validator<I, O> {
    return validate.extend(settings) as Validator<I, O>
}

//// Exports ////

export default validator 

export {

    Validate,

    validator,
    Validator,
    ValidatorSettings,

    ValidateOptions,
    ValidateContext,

}