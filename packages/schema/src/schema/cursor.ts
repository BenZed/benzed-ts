import { copy, Struct } from '@benzed/immutable'

import {
    merge,
    nil,
    ParamPipe,
    KeysOf,
    Pipe,
    Func,
    keysOf,
    defined,
    Infer,
} from '@benzed/util'
 
import {
    AnyValidate,
    GenericValidatorSettings as CursorSettings,
    Validate,
    ValidateConstructor,
    ValidateContext,
    ValidateOptions,
    Validator,
    ValidatorSettings,
} from '../validator'

import { ToValidator } from '../validator/validator-from'

import ensureSetters from './ensure-setters'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Helper Types ////

type _ValidatorSettingKeys = KeysOf<ValidatorSettings<any,any>>

type _CursorSettingDisallowedKeys = 
    KeysOf<CursorProperties<unknown, unknown, CursorSettings>> | 
    Extract<_ValidatorSettingKeys, 'transform' | 'isValid' | 'id'>

    type _NameToNamed<O extends object> = 'name' extends keyof O ? 'named' : never

type _CursorSettingKeys<O extends object> = Exclude<KeysOf<O>, _CursorSettingDisallowedKeys>
type _SchemaSetterKeys<O extends object> = 
    | Exclude<KeysOf<O>, _CursorSettingDisallowedKeys | 'name'> 
    | _NameToNamed<O>

type _CursorSetters<I, O, T extends CursorSettings> = {
    [K in _SchemaSetterKeys<T>]: K extends 'named' 
        ? (input: string) => Cursor<I, O, T>
        : K extends keyof T 
            ? (input: T[K]) => Cursor<I, O, T>
            : never
}

type _ToCursorSettings<I, O extends object> = Infer<{ 
    [K in _CursorSettingKeys<O>]: K extends _ValidatorSettingKeys 
        ? ValidatorSettings<I>[K]
        : O[K]
}, CursorSettings>
    
//// Types ////

type ValidatorPipe<I, O> = ParamPipe<I, O, [ValidateOptions | nil]>

interface CursorProperties<I, O, T extends CursorSettings> extends Validate<I, O>, Struct {

    settings: T

    /**
     * Mutably change this schema's settings
     */
    apply(settings: Partial<T>): this

    validate: ValidatorPipe<I, O>

}

type Cursor<I, O, T extends CursorSettings> = CursorProperties<I, O, T> & _CursorSetters<I, O, T>

type AnyCursor = Cursor<unknown, unknown, CursorSettings>

type ToCursor<V extends AnyValidate | CursorSettings> = V extends Validate<infer I, infer O> 
    ? Cursor<I, O, _ToCursorSettings<I, V>>
    : V extends CursorSettings 
        ? ToValidator<V> extends Validate<infer I, infer O>
            ? Cursor<I, O, _ToCursorSettings<I, V>>
            : never
        : never 

interface CursorConstructor extends ValidateConstructor {

    new <V extends CursorSettings | AnyValidate>(validate: V): ToCursor<V>
}

//// Implementation ////

function cursorValidate <I,O>(this: { validate: Validate<I, O> }, i: I, options?: Partial<ValidateOptions>): O {
    const ctx = new ValidateContext(i, options)

    return this.validate(i, ctx)

}

function getSettingsValidator(schema: { validate: Func }): AnyValidate {
    return schema.validate instanceof Pipe
        ? schema.validate.transforms[0]
        : schema.validate
}

//// Main ////

const Cursor = class extends Validate<unknown, unknown> {

    //// Instance ////

    constructor(settings: CursorSettings) {
        super(cursorValidate)

        this.validate = Pipe.from(Validator.from(settings))
        this._apply(settings)
    }

    get settings(): CursorSettings {
        return defined(getSettingsValidator(this))
    }

    override get name(): string {
        return getSettingsValidator(this).name
    }

    override apply(settings: CursorSettings): this {
        return this.copy()._apply(settings)
    }

    readonly validate: ValidatorPipe<unknown, unknown>

    //// Struct ////

    protected _apply(settings: CursorSettings): this {
        ensureSetters(this, settings)

        const validator = getSettingsValidator(this)

        // apply settings to main validator
        for (const key of keysOf(settings))
            (validator as any)[key] = settings[key]

        return this
    }

    override get state(): Partial<this> {
        const { validate } = this
        return { validate } as Partial<this>
    }

    override set state(value: Partial<this>) {
        let { validate } = value
        if (!validate)
            throw new Error('Invalid state.')

        if (validate instanceof Pipe)
            validate = Pipe.from(...validate.transforms.map(copy))
        
        merge(this, { validate })
    }

} as unknown as CursorConstructor

//// Exports ////

export default Cursor 

export {

    Cursor,
    CursorSettings,

    AnyCursor,
    ToCursor,

}