
import { $$equals, $$copy, CopyComparable, equals } from '@benzed/immutable'
import { isFunction, isInstanceOf } from '@benzed/is'

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Types ***/

interface NoSettings {
    [key: string]: never
}

interface ErrorSettings<A extends any[]> {
    readonly error?: string | ((...args: A) => string)
}

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

    public abstract validate(input: I, allowTransform: boolean): O

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

abstract class TransformValidator<I, O extends I = I, S extends object = NoSettings>
    extends Validator<I, I | O, S> {

    protected abstract transform(input: I): I | O

    public validate(input: I, allowTransform: boolean): I | O {
        return allowTransform ? this.transform(input) : input
    }
}

abstract class AssertValidator<
    I,
    O extends I = I,
    S extends ErrorSettings<any> = ErrorSettings<any>
>
    extends Validator<I, O, S> {

    protected abstract assert(input: I): asserts input is O

    public validate(input: I, _allowTransform?: boolean): O {
        this.assert(input)
        return input
    }

    /*** Helpers ***/

    protected _throwWithErrorSetting(
        ifUnset: NonNullable<S['error']>,
        ...args: S extends ErrorSettings<infer A> ? A : []
    ): never {

        const error = this.settings.error ?? ifUnset

        throw new Error(
            isFunction(error)
                ? error(...args)
                : error
        )
    }
}

abstract class DuplexValidator<
    I,
    O extends I = I,
    S extends ErrorSettings<any> = ErrorSettings<any>
>
    extends AssertValidator<I, O, S> {

    protected abstract transform(input: I): I | O

    protected abstract assert(input: I): asserts input is O

    public validate(input: I, allowTransform: boolean): O {

        const output = allowTransform
            ? this.transform(input)
            : input

        return super.validate(output, allowTransform)
    }

    /*** Helper ***/

    protected _throwOnTransformInequality(
        input: I,
        ifUnset: NonNullable<S['error']>,
        ...args: S extends ErrorSettings<infer A> ? A : []
    ): asserts input is O {

        if (!equals(input, this.transform(input))) {
            this._throwWithErrorSetting(
                ifUnset,
                ...args
            )
        }

    }
}

/*** Exports ***/

export default Validator

export {
    Validator,

    TransformValidator,
    AssertValidator,
    DuplexValidator,

    ErrorSettings
}