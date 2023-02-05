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

    /**
     * Create a clone of a struct without applying any state
     */
    statelessClone<T extends Struct>(struct: T): T

    /**
     * Given a struct and state, receive a new struct with the state applied.
     */
    applyState<T extends Struct>(struct: T, state: Partial<StructState<T>>): T

    new (): Struct
    new <F extends Func>(signature: F): Struct & F
}

//// Initialization ////

function applyCallable<T extends Struct>(struct: T, signature?: Func): T {

    return signature 
        ? Callable.create(signature, struct, provideCallableContext) as T
        : struct
}

function applyState<T extends Struct>(struct: T, state: Partial<StructState<T>>): T {
    const newStruct = copy(struct)

    newStruct[$$state] = { ...struct[$$state], ...state }

    return newStruct
}

function statelessClone<T extends Struct>(struct: T): T {
    
    const newStruct = Object.create(struct.constructor.prototype)

    const signature = isFunc(struct)
        ? Callable.signatureOf(struct)
        : nil 

    return applyCallable(newStruct, signature)
}

//// Implementation ////

abstract class Structural {

    static [Symbol.hasInstance] = Callable[Symbol.hasInstance]

    constructor(signature?: Func) {
        return applyCallable(this, signature)
    }
    
    get [$$state](): object {
        return { ...this } as object
    }

    protected set [$$state](state: object) {
        assign(this, state)
    }

    protected [$$copy](): this {
        const newStruct = statelessClone(this)

        newStruct[$$state] = this[$$state]

        return newStruct
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

    static statelessClone = statelessClone

    static applyState = applyState

} as StructConstructor

//// TODO ////

// Add StructProxy class

//// Exports ////

export default Struct

export {
    Struct,
    StructState,
    StructStateShape,
    $$state
}