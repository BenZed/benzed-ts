import { 
    assign, 
    Func, 
    nil, 
    provideCallableContext, 
    Callable, 
    isFunc 
} from '@benzed/util'

import copy, { $$copy } from './copy'

import equals, { $$equals } from './equals'

//// Symbols ////

const $$state = Symbol('struct-state')

//// Types ////

type StructState<T extends Struct> = T[typeof $$state]

interface StructStateShape<T extends object> {
    [$$state]: T
}

type Struct = Structural

interface StructConstructor {

    readonly $$state: typeof $$state

    applyState<T extends Struct>(struct: T, state: Partial<StructState<T>>): T

    new (): Struct
    new <F extends Func>(signature: F): Struct & F
}

//// Initialization ////

function initialize(struct: Struct, signature?: Func, state?: object): Struct {

    struct = signature     
        ? Callable.create(signature, struct, provideCallableContext) as Struct
        : struct

    if (state)
        struct[$$state] = { ...state }
    
    return struct

}

//// Implementation ////

abstract class Structural {

    static [Symbol.hasInstance] = Callable[Symbol.hasInstance]

    get [$$state](): object {
        return { ...this } as object
    }

    protected set [$$state](state: object) {
        assign(this, state)
    }

    protected [$$copy](): this {
        const clone = Object.create(this.constructor.prototype)
        const signature = isFunc(this)
            ? Callable.signatureOf(this)
            : nil 

        return initialize(clone, signature, this[$$state]) as this
    }
    
    protected [$$equals](other: unknown): other is this {
        return (
            other instanceof Struct && 
            other.constructor === this.constructor &&
            equals(this[$$state], other[$$state])
        )
    }
}

const Struct = class extends Structural {

    static $$state = $$state

    static applyState(struct: Struct, state: Partial<StructState<Struct>>): Struct {
        const newStruct = copy(struct)
        newStruct[$$state] = { ...struct[$$state], ...state }
        return newStruct
    }

    constructor(signature?: Func) {
        super()
        return initialize(this, signature) as this
    }

} as StructConstructor

//// Exports ////

export default Struct

export {
    Struct,
    StructState,
    StructStateShape,
    $$state
}