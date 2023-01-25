
import { unique } from '@benzed/array'
import { assign, Callable, Infer, isArray, isString, keysOf, KeysOf, pick } from '@benzed/util'
import Validate from './validate'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Symbols ////

const $$disallowed = Symbol('settings-keys-to-ignore')

//// Settings Types ////

type SettingsKeys<T extends object> = T extends { [$$disallowed]: infer K }
    ? K extends readonly string[] | string[]
        ? Exclude<KeysOf<T>, K[number]>
        : KeysOf<T>
    : KeysOf<T>

type SettingsOf<T extends object> = Infer<{
    [K in SettingsKeys<T>]: T[K]
}, object>

//// Helper ////

function getValidSettingsKeys<V extends AnyValidateStruct>(validator: V): SettingsKeys<V>[] {
    const allowedKeys = keysOf(validator)

    const disallowedKeys = $$disallowed in validator && isArray(validator[$$disallowed], isString)
        ? validator[$$disallowed]
        : []

    return Array
        .from(allowedKeys)
        .filter(allowedKey => !disallowedKeys.includes(allowedKey))
        .filter(unique) as SettingsKeys<V>[]
}

//// Main ////

type AnyValidateStruct = ValidateStruct<any,any>

// TODO hoist this up to @benzed/immutable
abstract class ValidateStruct<I,O extends I> extends Callable<Validate<I,O>> {

    protected readonly [$$disallowed]: readonly string[] = []

    static copy<V extends AnyValidateStruct>(input: V): V {

        const instance = Object.create(input)
        const signatureOf = Callable.signatureOf(input)
        const ctxProviderOf = Callable.contextProviderOf(input)

        return Callable.create(signatureOf, instance, ctxProviderOf)
    }

    static override apply<V extends AnyValidateStruct>(
        oldValidator: V, 
        settings: SettingsOf<V>
    ): V {

        const newValidator = this.copy(oldValidator)

        const validKeys = getValidSettingsKeys(oldValidator)
        const validSettings = pick(settings, ...validKeys)
        
        return assign(newValidator, validSettings) as V
    }

    static settingsOf<V extends AnyValidateStruct>(input: V): SettingsOf<V> {

        const validKeys = getValidSettingsKeys(input)
        const validSettings = pick(input, ...validKeys) 
        return validSettings as SettingsOf<V> 
    }

} 

export default ValidateStruct

export {
    ValidateStruct,
    $$disallowed
}