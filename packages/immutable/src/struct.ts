import { 
    assign, 
    Func, 
    KeysOf, 
    Property, 
    nil, 
    provideCallableContext, 
    Callable, 
    isFunc, 
    GenericObject
} from '@benzed/util'

import { $$copy } from './copy'

import equals, { $$equals } from './equals'

//// Setup ////

const $$state = Symbol('struct-state')

//// Helper Types ////

type _NonFuncKey<T, K extends keyof T> = T[K] extends Func ? never : K

type _DefaultStructState<T> = {
    [K in KeysOf<T> as _NonFuncKey<T,K>]: T[K]
}

//// Main Types ////

interface Struct {
    // [$$copy](): this
    // [$$equals](other: unknown): other is this
}

type StructState<T> = T extends StructStateLogic<infer S> 
    ? S 
    : _DefaultStructState<T>

interface StructStateLogic<T extends object> {

    get [$$state](): T

    set [$$state](value: T)

}

interface StructConstructor {

    readonly $$state: typeof $$state

    applyState<T extends Struct>(struct: T, state: StructState<T>): T

    new (): Struct
    new <F extends Func>(signature: F): Struct & F
}

//// Helper ////

function initStateLogic<T extends Struct>(struct: T): T {
    return new Proxy(struct, {

        ownKeys(struct) {

            const state = $$state in struct
                ? struct[$$state] as object
                : struct

            return Reflect.ownKeys(state)
        },

        get(struct, prop, value) {

            const isGenericStateGet = 
                prop === $$state && !($$state in struct)

            return isGenericStateGet 
                ? { ...struct }
                : Reflect.get(struct, prop, value)
        },

        set(struct, prop, value) {

            const isStateKey = prop === $$state 

            const stateDescriptor = isStateKey 
                ? Property.descriptorOf(struct.constructor.prototype, $$state) 
                : nil

            const isGenericStateSet = isStateKey && 
                !stateDescriptor?.writable && 
                !stateDescriptor?.set

            if (isGenericStateSet) {
                assign(struct, value)
                return true
            }

            return Reflect.set(struct, prop, value)
        }

    })
}

function initStruct(newStruct: Struct, signature?: Func, state?: GenericObject): Struct {

    newStruct = signature     
        ? Callable.create(signature, newStruct, provideCallableContext) as Struct
        : newStruct

    const initStruct = initStateLogic(newStruct)

    if (state)
        (initStruct as StructStateLogic<GenericObject>)[$$state] = state
    
    return initStruct

}

const Struct = class {

    static [Symbol.hasInstance] = Callable[Symbol.hasInstance]

    static $$state = $$state

    static applyState(struct: Struct, state: StructState<Struct>): Struct {
        const newStruct = Object.create(struct.constructor.prototype)

        const signature = isFunc(struct)
            ? Callable.signatureOf(struct)
            : nil

        return initStruct(newStruct, signature, state)
    }

    constructor(signature?: Func) {
        return initStruct(this, signature) as this
    }

    protected [$$copy](): this {
        const state = { ...this } as unknown as StructState<this>
        return Struct.applyState(this, state)
    }
    
    protected [$$equals](other: unknown): other is this {
        return (
            other instanceof Struct && 
            other.constructor === this.constructor &&
            equals({ ...this }, { ...other })
        )
    }

} as StructConstructor

//// Exports ////

export default Struct

export {
    Struct,
    StructState,
    StructStateLogic,
    $$state
}