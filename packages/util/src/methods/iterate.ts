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

//// Main ////

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

type Iterated<T, E extends (item: T) => unknown> = 
    ResolveAsyncOutput<
    ReturnType<E>,
    Awaited<ReturnType<E>> extends void 
        ? void 
        : Awaited<ReturnType<E>>[]
    >

function iterate<T>(
    iterable: Iter<T>
): Generator<T>

function iterate<T>(
    ...values: (T | Iter<T>)[]
): Generator<T>

function iterate<T, E extends (item: T) => unknown>(
    iterable: Iter<T>,
    each: E
): Iterated<T, E>

function iterate(...values: unknown[]): unknown {
    const eachIndex = values.findIndex(isFunc)
    const each = eachIndex > 0 ? values.at(eachIndex) as Func : nil
    if (!each)
        return generate(...values)

    const resultsIndex = eachIndex + 1
    const results = isArray(values[resultsIndex]) ? values[resultsIndex] as unknown[] : []

    for (const value of values) {
        if (value === each)
            break 

        const generator = generate(value)
        let iterator = generator.next()
        while (!iterator.done) {
            const output = each(iterator.value)

            const result = applyResolver(output, resolved => {
                if (isNotNil(resolved))
                    results.push(resolved)
            })
            if (isPromise(result)) 
                return result.then(() => iterate(generator, each, results))

            iterator = generator.next()
        }
    }
    return results.length > 0 ? results : nil

}

//// Extend ////

iterate.keys = keysOf
iterate.symbols = symbolsOf
iterate.indexes = indexesOf

//// Exports ////

export {
    iterate
}