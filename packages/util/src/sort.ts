import { Transform } from './classes/pipe'
import { isFunc, isNumber, isString, isSymbol } from './types'

//// Types ////

type Sortable = string | bigint | number | boolean | { valueOf(): number }

type SortableValues<T> = T extends string
    ? { length: number, [index: number]: unknown }
    : T extends object 
        ? { [K in keyof T as T[K] extends Sortable ? K : never]: T[K] } 
        : never

/**
 * Sorting method
 */
type Sorter<T = Sortable> = (a: T, b: T) => number

//// Helper ////

/**
 * Compares inputs as values
 */
const byValue: Sorter = (a, b) => (a as number) - (b as number)

type ByTransform<T> = Transform<T, Sortable>

const byTransform: <T>(transform: ByTransform<T>) => Sorter<T> = 
    transform => (a,b) => byValue(transform(a), transform(b))

/**
 * Keys of a given object that have sortable values
 */
type ByKey<T> = keyof SortableValues<T> extends infer K ? symbol | string extends K ? never : K : never

const byKey: <T>(key: ByKey<T>) => Sorter<T> = key => byTransform(v => v[key] as Sortable)

type ByTransformOrKey<T> = ByKey<T> | ByTransform<T>
const toSorter = <T>(option: ByTransformOrKey<T>): Sorter<T> => {

    if (isFunc(option))
        return byTransform(option)
    
    if (isString(option) || isNumber(option) || isSymbol(option))
        return byKey(option)

    return byValue as Sorter<T>
}

//// Main Method ////

interface By {
    <T>(): Sorter<T>
    <T>(key: ByKey<T>): Sorter<T>
    <T>(transform: ByTransform<T>): Sorter<T>
    <T>(...options: ByTransformOrKey<T>[]): Sorter<T>
    value: Sorter
}

const by = (<T>(...options: ByTransformOrKey<T>[]): Sorter<T> => {
 
    const sorters = options.map(toSorter)

    return (a, b) => {
        for (const sorter of sorters) {
            const result = sorter(a,b)
            if (result !== 0)
                return result
        }

        return byValue(a as Sortable, b as Sortable)
    }
}) as By

by.value = byValue

//// Exports ////

export default by

export {

    Sorter,
    Sortable,

    by

}