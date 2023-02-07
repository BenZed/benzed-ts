import { unique } from '@benzed/array'
import { InputOf, isEmpty, OutputOf } from '@benzed/util'

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

//// Types ////

type ValidatorProxySettings<V extends AnyValidateStruct> = {
    [$$target]: ValidateSettings<V>
}

type AnyValidatorProxy = ValidatorProxy<any,any,any>

//// Helper ////

function proxify<V extends AnyValidatorProxy>(validatorProxy: V): V {
    return new Proxy(validatorProxy, {
        get: validatorProxy[$$get],
        set: validatorProxy[$$set],
        ownKeys: validatorProxy[$$ownKeys],

    }) as V
}

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

        const validator = ValidateStruct.cloneWithoutState(this)

        validator[$$target] = this[$$target]
        // Due do the patchy nature of proxy state assignments,
        // we want the proxification to happen *before* state is
        // applied, so that sub state assignments are sorted
        const proxy = proxify(validator)
        
        proxy[$$settings] = this[$$settings]

        return proxy
    }

    override get [$$settings](): ValidatorProxySettings<V> {
        return { 
            [$$target]: this[$$target]
        } as unknown as ValidatorProxySettings<V>
    }

    override set [$$settings](state: ValidatorProxySettings<V> ) {

        // As a result of the wrapping we're doing, the state object 
        // we receive may have other properties on it that should be
        // applied to the target

        const { 
            [$$target]: target = this[$$target], 
            ...additionalTargetState 
        } = state 

        const newTarget = isEmpty(additionalTargetState)
            ? target
            : ValidateStruct.applySettings(
                target as V,
                additionalTargetState
            )

        this[$$target] = newTarget as V

    }
}

//// Exports ////

export {

    ValidatorProxy,
    ValidatorProxySettings,
    AnyValidatorProxy,
    $$target

}