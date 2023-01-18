import { ResolveAsyncOutput } from '../classes'

import { 
    Func, 
    indexesOf, 
    isArrayLike, 
    isFunc, 
    isIterable, 
    isRecord, 
    isPromise, 
    keysOf, 
    nil, 
    isArray, 
    isNotNil, 
    symbolsOf 
} from '../types'

import applyResolver from './apply-resovler'

//// Types ////

type Iter<T> = Iterable<T> | ArrayLike<T> | Record<string | number, T>

//// Helper ////

function* generate<T>(...values: (Iter<T> | T)[]): Generator<T> {
    for (const value of values) {
        if (isIterable(value)) {
            for (const result of value)
                yield result

        } else if (isArrayLike(value)) {
            for (const index of indexesOf(value))
                yield value[index]

        } else if (isRecord(value)) {
            for (const key of keysOf(value))
                yield value[key]

        } else 
            yield value
    }
}

function resolveResults<T, E extends (item: T, stop: () => T | void) => unknown>(
    iterable: Iterable<T>, each:E, results: unknown[] = []
): Iterated<T,E> {

    const pushToResults = (resolved: unknown): void => {
        if (isNotNil(resolved))
            results.push(resolved)
    }

    const breakGenerator = (value: T | void): void => {
        i = generator.return(value)
    }

    const generator = generate(iterable)
    let i = generator.next()
    while (!i.done) {
        const output = each(i.value, breakGenerator)

        const resolve = applyResolver(output, pushToResults)

        if (isPromise(resolve)) 
            return resolve.then(() => resolveResults(generator, each, results)) as Iterated<T,E>

        i = generator.next()
    }

    return (results.length > 0 ? results : nil) as Iterated<T,E>
}

//// Main ////

type Iterated<T, E extends (item: T, stop: () => T | void) => unknown> = 
    ResolveAsyncOutput<
    ReturnType<E>,
    Awaited<ReturnType<E>> extends void 
        ? void 
        : Awaited<ReturnType<E>>[]
    >
    
function iterate<T, E extends (item: T, stop: () => T | void) => unknown>(
    iterable: Iter<T>,
    each: E
): Iterated<T, E>
    
function iterate<T>(
    iterable: Iter<T>
): Generator<T>

function iterate<T>(
    ...values: (T | Iter<T>)[]
): Generator<T>

function iterate(...values: unknown[]): unknown {

    const [ iterable, each ] = values
    if (values.length === 2 && isIterable(iterable) && isFunc(each)) 
        return resolveResults(iterable, each)

    return generate(...values)
}

//// Extend ////

iterate.keys = keysOf
iterate.symbols = symbolsOf
iterate.indexes = indexesOf

//// Exports ////

export {
    iterate
}