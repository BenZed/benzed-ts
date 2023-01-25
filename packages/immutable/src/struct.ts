import {
    assign,
    Callable,
    CallableContextProvider,

    Func,
    Infer,
    keysOf,
    KeysOf,
    pick,
    provideCallableContext,

} from '@benzed/util'

import copy, { $$copy } from './copy'
import equals, { $$equals } from './equals'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Symbols ////

const $$assign = Symbol('struct-state-assign')

//// Helper ////

type StructState<T extends object> = Infer<{
    [K in KeysOf<T>]: T[K]
}, object>

type StructAssignState<T extends object> = Partial<StructState<T>>

//// Helper ////

function applyExistingState<S extends Struct>(struct: S, state: StructAssignState<S>): S {

    const previousState = { ...struct }
    const validState = pick(state, ...keysOf(previousState)) as StructAssignState<S>
    return applyNewState(struct, validState)
}

function applyNewState<S extends Struct>(struct: S, state: Partial<StructState<S>>): S {

    const newState = struct[$$assign](state)
    return assign(struct, newState) as S
}

//// StructBase ////

abstract class Struct {

    static readonly $$assign = $$assign

    static clone<S extends Struct>(struct: S): S {
        return Object.create(struct)
    }

    static apply<S extends Struct>(
        struct: S,
        newState: StructAssignState<S>
    ): S {
        const newStruct = copy(struct)

        const assignedStruct = applyExistingState(newStruct, newState)
        return assignedStruct
    }

    static [Symbol.hasInstance](input: unknown): boolean {
        // So that Structs are also instances of CallableStructs
        return Callable[Symbol.hasInstance].call(this, input)
    }

    //// Symbolic ////
 
    protected [$$assign](state: StructAssignState<this>): StructAssignState<this> {
        return state
    }
 
    protected [$$copy](): this {

        const state = { ...this } as unknown as StructAssignState<this>

        const newStruct = Struct.clone(this)

        const appliedStruct = applyNewState(newStruct, state)
        return appliedStruct
    }
    
    protected [$$equals](other: unknown): other is this {
        return other instanceof Struct && equals(
            { ...this },
            { ...other }
        )
    }
}

//// CallableStruct ////

type CallableStruct = typeof Struct & (
    abstract new <F extends Func>(
        signature: F, 
        ctxProvider?: CallableContextProvider<F>
    ) => F & Struct
)

const CallableStruct = class extends Struct {

    constructor(
        signature: Func, 
        ctxProvider: CallableContextProvider<Func> = provideCallableContext
    ) {
        super()
        return Callable.create(signature, this, ctxProvider) as this
    }

    override [$$copy](): this {

        const callable = this as unknown as Func
        const signature = Callable.signatureOf(callable)
        const ctxProvider = Callable.contextProviderOf(callable)

        const struct = super[$$copy]()
        
        return Callable.create(
            signature, 
            struct,
            ctxProvider
        ) as this
    }

} as unknown as CallableStruct

//// Exports ////

export default Struct

export {
    Struct,
    CallableStruct,

    StructState,
    StructAssignState,
}
