import { Map } from './types'

//// Types ////

type Sortable = string | bigint | number | { valueOf(): string | bigint | number }

type SortableValues<T> = {
    [K in keyof T as T[K] extends Sortable ? K : never]: K
}

/**
 * Keys of a given object that have sortable values
 */
 type SortableKeys<T> = keyof SortableValues<T>

/**
 * Sorting method
 */
type Sorter<T = Sortable> = (a: T, b: T) => number

//// By ////

/**
 * Compares inputs as values
 */
const byValue: Sorter = (a, b) => a > b ? 1 : a < b ? -1 : 0

/**
 * Compares inputs by checking with each provided sorter
 * until it finds one that doesn't return an equivalent result.
 */
const byMany = <T>(...sorters: Sorter<T>[]): Sorter<T> => (a, b) => {

    for (const sort of sorters) {
        const result = sort(a, b)
        if (result !== 0)
            return result
    }

    return 0
}

/**
 * Compares inputs by checking the result of an applied map
 * method.
 * 
 * Multiple maps may be provided, and will be checked if 
 * the previous outputs were equivalent.
 */
const byMap = <T>(...maps: Map<T, Sortable>[]): Sorter<T> =>
    byMany(
        ...maps.map(p => (a: T, b: T) => byValue(p(a), p(b)))
    )

/**
 * Compares objects by comparing against their provided sortable
 * property name.
 * 
 * Multiple properties may be provided, and will be checked if
 * previous property values were equivalent.
 */
const byProp = <T extends object, K extends SortableKeys<T>[]>(
    ...properties: K
): Sorter<T> =>
    byMany(
        ...properties.map((property) =>
            byMap(object => (object as SortableValues<T>)[property] as Sortable)
        )
    )

//// By Interface ////

const by = <T>(...args: ((input: T) => Sortable)[]): Sorter<T> => byMap(...args)
by.value = byValue
by.many = byMany
by.map = byMap
by.prop = byProp

//// Exports ////

export default by

export {

    Sorter,
    Sortable,
    SortableKeys,

    by,
    byValue,
    byMany,
    byMap,
    byProp

}