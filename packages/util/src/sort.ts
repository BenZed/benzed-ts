
import type { Pipe } from './pipe'

/* eslint-disable
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/explicit-function-return-type
 */

/*** Types ***/

type Sortable = string | bigint | number | { valueOf(): string | bigint | number }

type SortableKeys<T> = keyof {
    [K in keyof T as T[K] extends Sortable ? K : never]: K
}

type Sort<T = Sortable> = (a: T, b: T) => number

/*** By ***/

/**
 * Compares inputs as values
 */
const byValue: Sort = (a, b) => a > b ? 1 : a < b ? -1 : 0

/**
 * Compares inputs by checking with each provided sorter
 * until it finds one that doesn't return an equivalent result.
 */
const byMany = <T>(...sorters: Sort<T>[]): Sort<T> => (a, b) => {

    for (const sort of sorters) {
        const result = sort(a, b)
        if (result !== 0)
            return result
    }

    return 0
}

/**
 * Compares inputs by checking the result of an applied pipe
 * method.
 * 
 * Multiple pipes may be provided, and will be checked if 
 * the previous outputs were equivalent.
 */
const byPipe = <I>(...pipes: Pipe<I, Sortable>[]): Sort<I> =>
    byMany(
        ...pipes.map(pipe =>
            (a: I, b: I) => byValue(pipe(a), pipe(b))
        )
    )

/**
 * Compares objects by comparing against their provided sortable
 * property name.
 * 
 * Multiple properties may be provided, and will be checked if
 * previous property values were equivalent.
 */
const byProp = <T extends object, K extends SortableKeys<T>[]>(...properties: K): Sort<T> =>
    byMany(
        ...properties.map(property =>
            byPipe((t: any) => t[property])
        )
    )

/*** By Interface ***/

const by = {
    value: byValue,
    many: byMany,
    pipe: byPipe,
    prop: byProp
}

/*** Exports ***/

export default by

export {

    byValue as sort,
    Sort,
    Sortable,
    SortableKeys,

    byValue,
    byMany,
    byPipe,
    byProp

}