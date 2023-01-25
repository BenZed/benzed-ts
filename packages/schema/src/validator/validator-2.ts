
import { assign, Callable, Func, Infer, isArray, isString, KeysOf, nil, pick } from '@benzed/util'
import Validate, { AnyValidate, ValidateOptions } from './validate'
import ValidateContext from './validate-context'

////  ////

type Settings<I,O> = {
    name?: string
    error?: string
    isValid?(input: I): boolean
    transform?(input: I): O
}

type AnySettings = Settings<any,any>

type SettingsInput<S extends AnySettings> = S extends Settings<infer I, any> ? I : unknown
type SettingsOutput<S extends AnySettings> = S extends Settings<infer I, infer O> 
    ? unknown extends O 
        ? I 
        : O 
    : unknown

type CleanSettings<S extends AnySettings> = Infer<{
    [K in Exclude<KeysOf<S>, KeysOf<AnySettings>>]: S[K]
}, object>

type ToValidator<S extends AnySettings> = 
    
    Infer<
    
    Validate<
    /**/ SettingsInput<S>, 
    /**/ SettingsOutput<S>
    > 
    
    & CleanSettings<S>

    >

interface Validator2<I,O> extends Validate<I,O> {}

type InferThisContext<S extends AnySettings> = {
    [K in keyof S]: S[K] extends Func
        ? (this: S, ...args: Parameters<S[K]>) => ReturnType<S[K]>
        : S[K]
}

const $$settings = Symbol('retreive-state-keys')

interface Validator2Constructor {

    settings: typeof $$settings

    apply<V extends AnyValidate>(validator: V, settings: SettingsOf<V>): V

    copy<V extends AnyValidate>(validator: V): V

    settingsOf<V extends AnyValidate>(validator: V): SettingsOf<V>

    new <S extends AnySettings>(input: InferThisContext<S>): ToValidator<S>

}

//// Types ////

type SettingsKeys<T extends object> = T extends { [$$settings]: infer K }
    ? K extends KeysOf<T>
        ? K
        : KeysOf<T>
    : KeysOf<T>

type SettingsOf<T extends object> = Infer<{
    [K in SettingsKeys<T>]: T[K]
}, object>

function getSettingsKeys<T extends object>(object): KeysOf<T>[] | nil {
    return ($$settings in object && isArray(object[$$settings], isString)
        ? object[$$settings]
        : nil) as KeysOf<T>[] | nil
}

function getValidatorSettings<T extends object>(object: T): SettingsOf<T> {

    const keys = getSettingsKeys(object)

    return (keys 
        ? pick(object, ...keys) 
        : { ...object }) as SettingsOf<T>
}

function applyValidatorSettings<V extends AnyValidate>(
    validator: V, 
    settings: SettingsOf<V>
): V {

    const keys = getSettingsKeys(validator)

    const validSettings = (keys ? pick(settings, ...keys) : settings) as SettingsOf<V>

    const clone = copyValidator(validator)
    assign(clone, validSettings)
    return clone
}

function copyValidator<V extends AnyValidate>(
    validator: V
): V {
    const settings = getValidatorSettings(validator)
}

/**
 * Validate value based on dynamic settings
 */
function smartValidate<I,O>(
    this: object, 
    input: I, 
    options?: Partial<ValidateOptions>
): O {

    const ctx = new ValidateContext(input, options)

    return input as unknown as O
}

//// Main ////

export const Validator2 = class extends Callable<Validate<unknown>> {

    static override apply = applyValidatorSettings

    static copy = copyValidator

    static settingsOf = getValidatorSettings

    constructor(settings: object) {
        super(smartValidate)
        assign(this, settings)
    }

} as unknown as Validator2Constructor

export {
    getValidatorSettings
}