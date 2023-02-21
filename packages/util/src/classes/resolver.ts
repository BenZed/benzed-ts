import Callable from './callable'
import { Func, isPromise } from '../types'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type Then<T> = (input: T, ...args: any) => any

type Resolved<T, F extends Then<T>> = Resolver<Awaited<ReturnType<F>>>

//// Types ////

export type RemainingParams<F extends Then<any>> = Parameters<F> extends [any, ...infer P]
    ? P
    : Parameters<F>

interface ToThen<T> {
    <F extends Then<T>>(f: F, ...fParams: RemainingParams<F>): Resolved<T,F>
    (): Resolver<T>
}

//// Resolver Signature ////

const toResolved = function <T>(this: Resolver<T>, f?: Then<T>, ...params: RemainingParams<Then<T>>): Resolver<T> { 
    return (f ? this.then(f, ...params) : this) as Resolver<T>
}

//// Resolver Class ////

/**
 * Optionally syncronous thenable
 */
class Resolver<T> extends Callable<ToThen<T>> implements Iterable<T> {

    get value(): T {
        if (isPromise(this.output))
            throw new Error('Value is asyncronous.')

        return this.output
    }

    get result(): T {
        return this.value
    }

    constructor(readonly output: T | Promise<T>) {
        super(toResolved)
    }

    then<F extends Then<T>>(func: F, ...params: RemainingParams<F>): Resolved<T,F> {

        const f = func as Func

        const { output: input } = this
        const output = isPromise(input)
            ? input.then(resolved => f(resolved, ...params))
            : f(input, ...params)
        
        return new Resolver(output) as Resolved<T,F>
    }

    *[Symbol.iterator](): Iterator<T> {
        yield this.value
    }
}

//// Shortcuts ////

/**
 * Place a value inside an optionally syncronous thenable.
 */
function resolve<T>(input: T | Promise<T>): Resolver<T> {
    return new Resolver(input)
}

//// Exports ////

export default Resolver

export {
    Resolver,
    resolve,
}