import { AnyTypeGuard, Func, isIntersection, isObject, isShape } from '@benzed/util'

import Struct from './struct'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Symbols ////

const $$target = Symbol('mutator-target')

//// Types ////

/**
 * A Node is a Module with other modules as it's state
 */
interface Mutator<T extends object> extends Struct {

    readonly [$$target]: T

}

type AnyMutator = Mutator<any>

interface MutatorConstructor {

    readonly is: typeof isMutator

    new <T extends object>(target: T): Mutator<T>
    new <T extends object, F extends Func>(target: T, func: F): Mutator<T> & F

}

//// Helper ////

const isMutator: <T extends object>(input: unknown) => input is Mutator<T> = 
    isIntersection(
        Struct.is, 
        isShape({
            [$$target]: isObject
        })
    ) as AnyTypeGuard

//// Node ////

const Mutator = class Mutator<T extends object> extends Struct<any> {

    static override is = isMutator

    constructor(
        target: T,
        signature?: Func
    ) {
        super(signature)
        this[$$target] = target
    }
    
    readonly [$$target]: T

} as MutatorConstructor

//// Exports ////

export {
    AnyMutator,
    Mutator,
    MutatorConstructor,
}