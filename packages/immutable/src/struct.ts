import { 
    AnyTypeGuard,
    Callable,
    Func, 
    isFunc,
    isIntersection,
    nil, 
    provideCallableContext,
    TypeGuard,
} from '@benzed/util'

import { equals, $$equals, isComparable } from './equals'
import { $$copy, isCopyable } from './copy'

import {
    getDeepState,
    getShallowState,
    matchKeyVisibility,
    setState,
} from './state'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helpers ////

function applySignature<T extends Struct>(struct: T, signature?: Func): T {
    return signature

        ? Callable.create(
            signature,
            struct,
            provideCallableContext
        ) as T

        : struct
}

function copyWithoutState<T extends Struct>(struct: T): T {
    
    const newStruct = Object.create(struct.constructor.prototype)

    const signature = isFunc(struct)
        ? Callable.signatureOf(struct)
        : nil

    return applySignature(newStruct, signature)
}

const isStructural: TypeGuard<Structural> = 
    isIntersection(isCopyable, isComparable) as AnyTypeGuard

//// Base Implementation ////

abstract class Structural {

    static [Symbol.hasInstance] = Callable[Symbol.hasInstance]

    constructor(signature?: Func) {
        return applySignature(
            this,
            signature
        ) as this
    }

    protected [$$copy](): this {

        const struct = copyWithoutState(this)
        const state = getShallowState(this)
        setState(struct, state)
        matchKeyVisibility(this, struct)

        return struct
    }

    protected [$$equals](other: unknown): other is this {
        return isStructural(other) && 
        this.constructor === other.constructor &&
        equals(
            getDeepState(this),
            getDeepState(other)
        )
    }
}

//// Main Types ////

type Struct = Structural

interface StructConstructor {

    is(input: unknown): input is Struct

    new (): Struct
    new <F extends Func>(signature: F): Struct & F
}

//// Main Implementation ////

const Struct = class Struct extends Structural {

    static is = isStructural

} as StructConstructor

//// Exports ////

export default Struct 

export {
    Struct,
    isStructural,
    StructConstructor,

    copyWithoutState
}