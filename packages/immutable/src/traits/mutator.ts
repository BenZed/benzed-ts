import { Trait, isShape, isObject, AnyTypeGuard } from '@benzed/util'

//// Symbols ////

const $$target = Symbol('mutator-target')

const $$get = Symbol('mutator-get')
const $$set = Symbol('mutator-set')
const $$has = Symbol('mutator-has')
const $$ownKeys = Symbol('mutator-ownKeys')
const $$getPrototypeOf = Symbol('mutator-get-prototype-of')
const $$setPrototypeOf = Symbol('mutator-set-prototype-of')
const $$getOwnPropertyDescriptor = Symbol('mutator-get-own-property-descriptor')
const $$defineProperty = Symbol('mutator-defined-property')
const $$deleteProperty = Symbol('mutator-delete-property')

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/explicit-function-return-type,
    @typescript-eslint/no-explicit-any
*/
//// Main ////

abstract class Mutator<T extends object> extends Trait {

    static readonly target: typeof $$target = $$target
    static readonly get: typeof $$get = $$get
    static readonly set: typeof $$set = $$set
    static readonly has: typeof $$has = $$has
    static readonly ownKeys: typeof $$ownKeys = $$ownKeys
    static readonly getPrototypeOf: typeof $$getPrototypeOf = $$getPrototypeOf
    static readonly setPrototypeOf: typeof $$setPrototypeOf = $$setPrototypeOf
    static readonly defineProperty: typeof $$defineProperty = $$defineProperty
    static readonly deleteProperty: typeof $$deleteProperty = $$deleteProperty
    static readonly getOwnPropertyDescriptor: typeof $$getOwnPropertyDescriptor = $$getOwnPropertyDescriptor

    static [Trait.apply](mutator: Mutator<any>): Mutator<any> {
        return new Proxy(mutator, {
            get: mutator[$$get],
            set: mutator[$$set],
            has: mutator[$$has],
            ownKeys: mutator[$$ownKeys],
            getPrototypeOf: mutator[$$getPrototypeOf],
            setPrototypeOf: mutator[$$setPrototypeOf],
            defineProperty: mutator[$$defineProperty],
            deleteProperty: mutator[$$deleteProperty],
            getOwnPropertyDescriptor: mutator[$$getOwnPropertyDescriptor]
        })
    }

    static override readonly is: <Tx extends object>(input: unknown) => input is Mutator<Tx> = isShape({
        [$$target]: isObject
    }) as AnyTypeGuard

    abstract get [$$target](): T

    protected [$$get](mutator: Mutator<T>, key: keyof T, proxy: this) {

        const target = Reflect.has(mutator, key) && !Reflect.has(mutator[$$target], key)
            ? mutator
            : mutator[$$target]

        return Reflect.get(target, key, proxy)
    }

    protected [$$set](mutator: Mutator<T>, key: keyof T, value: T[keyof T], receiver: unknown) {

        const target = Reflect.has(mutator, key) && !Reflect.has(mutator[$$target], key)
            ? mutator
            : mutator[$$target]

        return Reflect.set(target, key, value, receiver)
    }

    protected [$$has](mutator: Mutator<T>, key: keyof T) {
        return Reflect.has(mutator[$$target], key)
    }

    protected [$$getPrototypeOf](mutator: Mutator<T>) {
        return Reflect.getPrototypeOf(mutator[$$target])
    }

    protected [$$setPrototypeOf](mutator: Mutator<T>, proto: object) {
        return Reflect.setPrototypeOf(mutator[$$target], proto)
    }

    protected [$$ownKeys](mutator: Mutator<T>) {
        return Reflect.ownKeys(mutator[$$target])
    }

    protected [$$defineProperty](mutator: Mutator<T>, key: PropertyKey, attributes: PropertyDescriptor) {
        return Reflect.defineProperty(mutator[$$target], key, attributes)
    }

    protected [$$deleteProperty](mutator: Mutator<T>, key: keyof T) {
        return Reflect.deleteProperty(mutator[$$target], key)
    }

    protected [$$getOwnPropertyDescriptor](mutator: Mutator<T>, key: PropertyKey) {
        return Reflect.getOwnPropertyDescriptor(mutator, key)
    }

}

//// Exports ////

export default Mutator

export {
    Mutator
}