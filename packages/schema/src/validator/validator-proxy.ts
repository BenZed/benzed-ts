import { $$copy, $$state } from '@benzed/immutable'
import { InputOf, isEmpty, OutputOf } from '@benzed/util'

import { AnyValidatorStruct, ValidatorStruct } from './validator-struct'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Symbol ////

const $$target = Symbol('proxy-target')

const $$get = Symbol('proxy-get')
const $$set = Symbol('proxy-set')
// const $$ownKeys = Symbol('proxy-ownKeys')
// const $$apply = Symbol('proxy-apply')

//// Types ////

type ValidatorProxyState<V extends AnyValidatorStruct> = {
    [$$target]: V
}

type AnyValidatorProxy = ValidatorProxy<any,any,any>

//// Helper ////

function proxify<V extends AnyValidatorProxy>(validatorProxy: V): V {
    return new Proxy(validatorProxy, {
        get: validatorProxy[$$get],
        set: validatorProxy[$$set],
        // ownKeys: validatorProxy[$$ownKeys],
        // apply: validatorProxy[$$apply]

    }) as V
}

//// ValidaotProxy ////

/**
 * A validator that wraps another to change it's functionlity.
 */
abstract class ValidatorProxy<V extends AnyValidatorStruct, I = InputOf<V>, O extends I = OutputOf<V>> 
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

        const target = key === $$state
            ? mutator 
            : mutator[$$target]

        return Reflect.set(target, key, value, proxy)
    }

    //// Struct ////

    protected override [$$copy](): this {
        const validator = ValidatorProxy.statelessClone(this)

        validator[$$target] = this[$$target]
        // Due do the patchy nature of proxy state assignments,
        // we want the proxification to happen *before* state is
        // applied.
        const proxy = proxify(validator)
        
        proxy[$$state] = this[$$state]

        return proxy
    }

    override get [$$state](): ValidatorProxyState<V> {
        return { 
            [$$target]: this[$$target]
        } as ValidatorProxyState<V>
    }

    override set [$$state](state: ValidatorProxyState<V> ) {

        // As a result of the wrapping we're doing, the state object 
        // we receive may have other properties on it that should be
        // applied to the target

        const { [$$target]: target = this[$$target], ...additionalTargetState } = state 

        const newTarget = isEmpty(additionalTargetState)
            ? target
            : ValidatorProxy.applyState(target, additionalTargetState)

        this[$$target] = newTarget 
        
    }
}

//// Exports ////

export {

    ValidatorProxy,
    ValidatorProxyState,
    AnyValidatorProxy,
    $$target

}