
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

//// Linting ////

/* eslint-disable @typescript-eslint/no-explicit-any */

//// Types ////

interface NoSettings {
    [key: string]: never
}

type ErrorMethod<A extends any[] = any[]> = (...args: A) => string
interface ErrorSettings<A extends any[] = any[]> {
    readonly error?: string | ErrorMethod<A>
}

type ErrorArgs<T> = T extends ErrorSettings<infer A> ? A : []

type ErrorDefault<T extends ErrorSettings> = NonNullable<T['error']>

type ErrorDefaultAndArgs<T extends ErrorSettings> = [ErrorDefault<T>, ...ErrorArgs<T>]

//// Main ////

abstract class Validator<
    I,
    O extends I = I,
    S extends object = object,
/**/> implements CopyComparable<Validator<I, O, S>> {

    //// State ////

    private _settings: S
    get settings(): Readonly<S> {
        return this._settings
    }

    //// Construction ////

    constructor (settings: S) {
        this._settings = this._stripUndefinedSettings(settings) as S
        this._onApplySettings()
    }

    //// Validation ////

    abstract validate(input: I, allowTransform: boolean): I | O

    //// Helpers ////

    applySettings(settings: Partial<S>): void {

        this._settings = {
            ...this._settings,
            ...this._stripUndefinedSettings(settings)
        }

        this._onApplySettings()
    }

    protected _onApplySettings(): void { /**/ }

    //// CopyComparable Implementation ////

    [$$equals](other: unknown): other is this {
        return isInstanceOf(other, this.constructor) &&
            equals(other.settings, this.settings)
    }

    [$$copy](): this {
        const ThisValidator = this.constructor as new (settings: S) => this
        return new ThisValidator(this.settings)
    }

    //// Helper ////

    private _stripUndefinedSettings(settings: Partial<S>): Partial<S> {

        const strippedSettings: Partial<S> = {}

        for (const key in settings) {
            if (settings[key] !== undefined)
                strippedSettings[key] = settings[key]
        }

        return strippedSettings
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

    validate(input: I, allowTransform: boolean): I | O {
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
    S extends ErrorSettings = ErrorSettings
>
    extends TransformValidator<I, O, S> {

    protected abstract _assert(input: I): asserts input is O

    override validate(input: I, allowTransform: boolean): O {
        const output = super.validate(input, allowTransform)

        this._assert(output)

        return output
    }

    //// Helpers ////

    protected _throwWithErrorSetting(
        errorDefault: ErrorDefault<S>,
        ...args: ErrorArgs<S>
    ): never {

        const error = this.settings.error ?? errorDefault

        throw new Error(
            isFunction<ErrorMethod<ErrorArgs<S>>>(error)
                ? error(...args)
                : error
        )
    }
}

/**
 * An assert-validator does not make transformations on data, just assertions.
 */
abstract class AssertValidator<O, S extends ErrorSettings>
    extends AssertTransformValidator<O, O, S> {

    protected _transform(input: O): O {
        return input
    }

    override validate(input: O): O {
        return super.validate(input, false)
    }

}

/**
 * An assert-valid-transform is a convenience abstraction that transforms
 * data to the expected output type. If transforms are now allowed for validation,
 * it throws if the input is not the same was what the transformation would be.
 * 
 * Most validators will be this.
 */
abstract class AssertValidTransformValidator<
    O,
    S extends ErrorSettings = ErrorSettings
>
    extends AssertTransformValidator<O, O, S> {

    //// AssertTransformValidator Implementation ////

    protected _assert(
        input: O
    ): void {
        if (!this._isValid(input)) {

            const [errorDefault, ...errorArgs] = this._getErrorDefaultAndArgs(input)

            this._throwWithErrorSetting(
                errorDefault,
                ...errorArgs
            )
        }
    }

    //// Helper ////

    protected _isValid(input: O): boolean {
        return equals(input, this._transform(input))
    }

    protected abstract _getErrorDefaultAndArgs(
        input: O
    ): ErrorDefaultAndArgs<S>

}

//// Exports ////

export default Validator

export {
    Validator,

    TransformValidator,
    AssertValidator,
    AssertTransformValidator,
    AssertValidTransformValidator,

    NoSettings,
    ErrorSettings,
    ErrorDefault,
    ErrorDefaultAndArgs
}