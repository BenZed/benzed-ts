import { $$copy, $$state, StructState } from '@benzed/immutable'
import { InputOf, OutputOf } from '@benzed/util/src'

import { AnyValidatorStruct, ValidatorStruct } from '../validator-struct'

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

type ValidatorProxyState<V extends AnyValidatorStruct> = 
    StructState<V> & {
        [$$target]: V
    }

type AnyValidatorProxy = ValidatorProxy<any,any,any>

//// Implementation ////

function proxify<V extends AnyValidatorProxy>(validatorProxy: V): V {
    return new Proxy(validatorProxy, {
        get: validatorProxy[$$get],
        set: validatorProxy[$$set],
        // ownKeys: validatorProxy[$$ownKeys],
        // apply: validatorProxy[$$apply]

    }) as V
}

abstract class ValidatorProxy<V extends AnyValidatorStruct, I = InputOf<V>, O extends I = OutputOf<V>> 
    extends ValidatorStruct<I, O> {

    static $$target = $$target

    protected readonly [$$target]: V

    constructor(validate: V) {
        super()
        this[$$target] = validate
        return proxify(this)
    }

    //// ValidatorStruct Implementation ////
    
    override get name(): string {
        return this.constructor.name
    }

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
        const clone = super[$$copy]()
        return proxify(clone)
    }

    override get [$$state](): ValidatorProxyState<V> {

        const target = this[$$target]
        const targetState = target[$$state]

        const state = { 
            ...targetState, 
            [$$target]: this[$$target]
        }

        return state
    }

    override set [$$state](state: ValidatorProxyState<V>) {

        const { [$$target]: target, ...targetState } = state

        const that = this as any
        that[$$target] = ValidatorStruct.applyState(
            target, 
            targetState as StructState<V>
        )
    }
}

//// Exports ////

export {

    ValidatorProxy,
    AnyValidatorProxy,
    $$target

}