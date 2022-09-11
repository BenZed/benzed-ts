
import {
    $$equals,
    $$copy,

    equals,

    CopyComparable,

} from '@benzed/immutable'

import {
    isFunction,
    isInstanceOf
} from '@benzed/is'

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Types ***/

interface NoSettings {
    [key: string]: never
}

interface ErrorSettings<A extends any[]> {
    readonly error?: string | ((...args: A) => string)
}

type ErrorArgs<T> = T extends ErrorSettings<infer A> ? A : []

type ErrorDefault<T extends ErrorSettings<any>> = NonNullable<T['error']>

type ErrorDefaultAndArgs<T extends ErrorSettings<any>> = [ErrorDefault<T>, ...ErrorArgs<T>]

/*** Main ***/

abstract class Validator<
    I,
    O extends I = I,
    S extends object = object,
/**/> implements CopyComparable<Validator<I, O, S>> {

    /*** State ***/

    private _settings: S
    public get settings(): Readonly<S> {
        return this._settings
    }

    /*** Construction ***/

    public constructor (settings: S) {
        this._settings = { ...settings }
    }

    /*** Validation ***/

    public abstract validate(input: I, allowTransform: boolean): I | O

    /*** Helpers ***/

    public applySettings(settings: Partial<S>): void {

        this._settings = {
            ...this._settings,
            ...settings
        }

    }

    /*** CopyComparable Implementation ***/

    public [$$equals](other: unknown): other is this {
        return isInstanceOf(other, this.constructor) &&
            equals(other.settings, this.settings)
    }

    public [$$copy](): this {
        const ThisValidator = this.constructor as new (settings: S) => this
        return new ThisValidator(this.settings)
    }
}

/**
 * A transform validator manipulates data, potentially converting to the
 * expected output type. 
 * 
 * A transformation will only occur if they are allowed for a validation.
 */
abstract class TransformValidator<I, O extends I = I, S extends object = NoSettings>
    extends Validator<I, I | O, S> {

    protected abstract _transform(input: I): I | O

    public validate(input: I, allowTransform: boolean): I | O {
        return allowTransform ? this._transform(input) : input
    }

}

/**
 * Extending on the transform validator, the assert-transform validator
 * asserts that data is of the expected output type, weather a transformation
 * has occured or not.
 */
abstract class AssertTransformValidator<
    I,
    O extends I = I,
    S extends ErrorSettings<any> = ErrorSettings<any>
>
    extends TransformValidator<I, O, S> {

    protected abstract _assert(input: I): asserts input is O

    public validate(input: I, allowTransform: boolean): O {
        const output = super.validate(input, allowTransform)

        this._assert(output)

        return output
    }

    /*** Helpers ***/

    protected _throwWithErrorSetting(
        errorDefault: ErrorDefault<S>,
        ...args: S extends ErrorSettings<infer A> ? A : []
    ): never {

        const error = this.settings.error ?? errorDefault

        throw new Error(
            isFunction(error)
                ? error(...args)
                : error
        )

    }

}

/**
 * An assert-validator does not make transformations on data, just assertions.
 */
abstract class AssertValidator<O, S extends ErrorSettings<any>>
    extends AssertTransformValidator<O, O, S> {

    protected _transform(input: O): O {
        return input
    }

    public override validate(input: O): O {
        return super.validate(input, false)
    }

}

/**
 * An assert-transform-equal is a convenience abstraction that transforms
 * data to the expected output type. If transforms are now allowed for validation,
 * it throws if the input is not the same was what the transformation would be.
 * 
 * Most validators will be this.
 */
abstract class AssertTransformEqualValidator<
    O,
    S extends ErrorSettings<any> = ErrorSettings<any>
>
    extends AssertTransformValidator<O, O, S> {

    /*** AssertTransformValidator Implementation ***/

    protected _assert(
        input: O
    ): void {
        if (!equals(input, this._transform(input))) {

            const [errorDefault, ...errorArgs] = this._getErrorDefaultAndArgs(input)

            this._throwWithErrorSetting(
                errorDefault,
                ...errorArgs
            )
        }
    }

    /*** Helper ***/

    protected abstract _getErrorDefaultAndArgs(
        input: O
    ): ErrorDefaultAndArgs<S>

}

/*** Exports ***/

export default Validator

export {
    Validator,

    TransformValidator,
    AssertValidator,
    AssertTransformValidator,
    AssertTransformEqualValidator,

    ErrorSettings,
    ErrorDefaultAndArgs
}