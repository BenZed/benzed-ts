import { TypeOf, nil, Func, Property } from '@benzed/util'
import { Validate, ValidateOptions } from '../validator'
import { AnySchematic } from '../schema'
import { Ref } from './util'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper Types ////

type _InheritOptional<T> = T extends AnySchematic 
    ? Optional<T> 
    : T extends Func
        ? ReturnType<T> extends AnySchematic 
            ? (...params: Parameters<T>) => Optional<ReturnType<T>>
            : T
        : T

//// Types ////

type Optional<T extends AnySchematic> = 
    & Ref<TypeOf<T> | nil> 
    & {
        [K in keyof T]: K extends 'of' ? T[K] : _InheritOptional<T[K]>
    } 
    & {
        required: T
    }

//// Implementation ////

function validateOptional(
    this: Optional<AnySchematic>, 
    input: unknown, 
    options?: ValidateOptions
): unknown | nil {

    try {
        return this.ref.validate(input, options)
    } catch (e) {
        if (input === nil)
            return input
        throw e
    }
}

const Optional = class extends Ref<unknown> {

    get required(): AnySchematic {
        return this.ref
    }

    protected override _setValidate(): Validate<unknown, unknown | nil> {
        return Property.name(
            validateOptional.bind(this as Optional<AnySchematic>), 
            'validateOptional'
        )
    }

} as unknown as new <T extends AnySchematic>(ref: T) => Optional<T>

//// Exports ////

export default Optional

export {
    Optional
}