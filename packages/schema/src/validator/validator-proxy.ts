import { unique } from '@benzed/array'
import { InputOf, OutputOf } from '@benzed/util'

import { ValidateStruct, $$settings, $$clone, ValidateSettings, AnyValidateStruct } from './validate-struct'

import { ValidatorStruct } from './validator-struct'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Symbol ////

const $$target = Symbol('proxy-target')

const $$get = Symbol('proxy-get')
const $$set = Symbol('proxy-set')
const $$ownKeys = Symbol('proxy-own-keys')

//// Helper ////

function proxify<V extends AnyValidatorProxy>(validatorProxy: V): V {
    return new Proxy(validatorProxy, {
        get: validatorProxy[$$get],
        set: validatorProxy[$$set],
        ownKeys: validatorProxy[$$ownKeys],

    }) as V
}

type AnyValidatorProxy = ValidatorProxy<AnyValidateStruct, any, any>

//// ValidatorProxy ////

/**
 * A validator that wraps another to change it's functionality.
 */
abstract class ValidatorProxy<V extends AnyValidateStruct, I = InputOf<V>, O extends I = OutputOf<V>> 
    extends ValidatorStruct<I, O> {

    static $$target = $$target

    constructor(validate: V) {
        super()
        this[$$target] = validate
        return proxify(this)
    }

    //// Construct ////
    
    protected [$$target]: V

    //// Mutations ////
    
    protected [$$get](
        mutator: this, 
        key: string | symbol, 
        proxy: typeof Proxy
    ): unknown {

        const target = Reflect.has(mutator, key)
            ? mutator 
            : mutator[$$target]

        return Reflect.get(target, key, proxy)
    }

    protected [$$set](
        mutator: this, 
        key: string | symbol, 
        value: unknown,
        proxy: typeof Proxy
    ): boolean {

        const target = key === $$settings
            ? mutator 
            : mutator[$$target]

        return Reflect.set(target, key, value, proxy)
    }

    protected [$$ownKeys](
        mutator: this, 
    ): (string | symbol)[] {
        return [
            ...Reflect.ownKeys(mutator),
            ...Reflect.ownKeys(mutator[$$target]),
        ].filter(unique)
    }
    //// Struct ////

    protected override [$$clone](): this {

        const newProxyValidator = ValidateStruct.cloneWithoutState(this)
        newProxyValidator[$$target] = this[$$target]

        return proxify(newProxyValidator)
    }

    override get [$$settings](): ValidateSettings<V> {
        return ValidatorStruct.getSettings(this[$$target])
    }

    override set [$$settings](input: ValidateSettings<V>) {
        this[$$target] = ValidatorStruct.applySettings(this[$$target], input)
    }

}

//// Exports ////

export {

    ValidatorProxy,
    AnyValidatorProxy,
    $$target

}