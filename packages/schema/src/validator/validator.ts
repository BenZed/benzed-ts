
/*** Types ***/

import { $$equals, $$copy, CopyComparable, equals } from '@benzed/immutable'
import { isFunction, isInstanceOf } from '@benzed/is'

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Main ***/

abstract class Validator<
    I,
    O = I,
    S extends object = object,
/**/> implements CopyComparable<Validator<I, O, S>> {

    private _settings: S
    public get settings(): Readonly<S> {
        return this._settings
    }

    public constructor (settings: S) {
        this._settings = { ...settings }
    }

    public abstract validate(input: I, allowTransform: boolean): O

    public applySettings(settings: Partial<S>): this {

        this._settings = {
            ...this._settings,
            ...settings
        }

        return this
    }

    public [$$equals](other: unknown): other is this {
        return isInstanceOf(other, this.constructor) &&
            equals(other.settings, this.settings)
    }

    public [$$copy](): this {
        const ThisValidator = this.constructor as new (settings: S) => this
        return new ThisValidator(this.settings)
    }
}

interface NoSettings {
    [key: string]: never
}

interface ErrorSettings<A extends any[]> {
    readonly error?: string | ((...args: A) => string)
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

    protected _getErrorMsg<A extends any[]>(
        error: string | ((...args: A) => string),
        ...args: A
    ): string {
        return isFunction(error)
            ? error(...args)
            : error
    }

    public validate(input: I): O {
        this.assert(input)
        return input
    }
}

abstract class DuplexValidator<
    I,
    O extends I = I,
    S extends ErrorSettings<any> = ErrorSettings<any>
>
    extends TransformValidator<I, O, S> {

    protected abstract transform(input: I): I | O

    protected abstract assert(input: I): asserts input is O

    protected _getErrorMsg<A extends any[]>(
        error: string | ((...args: A) => string),
        ...args: A
    ): string {
        return isFunction(error)
            ? error(...args)
            : error
    }
    public validate(input: I, allowTransform: boolean): O {
        const output = super.validate(input, allowTransform)
        this.assert(output)
        return output
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