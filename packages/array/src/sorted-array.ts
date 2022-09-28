import { Sortable, isSortedArray } from '@benzed/is'
import { max as _max } from './min-max'
/*** Types ***/

type CompareFn<T> = NonNullable<Parameters<Array<T>['sort']>[0]>

/*** Helper ***/

/**
 * Sorter method that places the items in an array in ascending order.
 */
function ascending<T>(a: T, b: T): number {
    //             ^ purposefully not extending Sortable so this
    //               method can be exported to be used on regular
    //               arrays.

    return (a as unknown as number) - (b as unknown as number)
}

/**
 * Sorter method that places the items in an array in descending order.
 */
function descending<T>(a: T, b: T): number {
    return (b as unknown as number) - (a as unknown as number)
}

/*** Main ***/
class SortedArray<T extends Sortable> extends Array<T> {

    public constructor (...params: T[]) {

        // initialize array with length
        super(params.length)

        for (let i = 0; i < this.length; i++)
            this[i] = params[i]

        this.sort()
    }

    /**
     * Sorts the array in place, by default in ascending order. 
     * A sorter method may be provided to apply custom sorting order.
     * @param sorter 
     * @returns 
     */
    public sort(sorter: CompareFn<T> = ascending): this {

        const { length } = this

        for (let i = 1; i < length; i++) {
            const item = this[i]

            let ii: number
            for (
                ii = i - 1;
                ii >= 0 && sorter(this[ii], item) > 0;
                ii--
            )
                this[ii + 1] = this[ii]

            this[ii + 1] = item
        }

        return this
    }

    /**
     * Returns true if the array is currently sorted.
     */
    public get isSorted(): boolean {
        return isSortedArray(this)
    }

    /**
     * Returns a duplicate of this array. Extended array implementations
     * can't take advantage of the array spread operator `[...]`, so this
     * is provided as a convenience method for the rare occasions where
     * you'd like to copy an array in place before chaining a mutating
     * method.
     * 
     * ```typescript
     * 
     * const sa1 = new SortedArray(1,2,3) 
     * const sa2 = sa1.copy().reverse()
     * //          ^ because [...sa1].reverse() 
     * //          won't result in a SortedArray
     * 
     * ```
     */
    public copy(): SortedArray<T> {

        const clone = new SortedArray<T>()

        for (let i = 0; i < this.length; i++)
            clone[i] = this[i]

        return clone
    }

    /**
     * Returns the last index of a given value in the array using
     * binary search.
     * @param value 
     * @returns found index or -1 if value cannot be found.
     */
    public lastIndexOf(value: T): number {

        let index = this._getIndexViaBinarySearch(value, false)

        // in case the array is in descending order
        while (this[index + 1] === value)
            index++

        return index
    }

    /**
     * Returns the first index of a given value in the array using
     * binary search.
     * @param value 
     * @returns found index or -1 if value cannot be found.
     */
    public indexOf(value: T): number {

        let index = this._getIndexViaBinarySearch(value, false)

        // in case the array is in ascending order
        while (this[index - 1] === value)
            index--

        return index
    }

    /**
     * Returns the index of the value in the array, or the index of the item
     * closest to it.
     */
    public closestIndexOf(
        value: T,
    ): number {
        return this._getIndexViaBinarySearch(value, true)
    }

    public reverse(): this {
        return super.reverse.call(this) as this
        // this needs to be implemented because the inherited Array['reverse']
        // method return type seems to be `Array<T>` instead of `this`
    }

    /*** Helper ***/

    private _getIndexViaBinarySearch(
        value: T,

        /**
         * Returns the index of the value in the array that was
         * higher than the provided.
         */
        getClosest: boolean
    ): number {

        let min = 0
        let max = this.length

        const isAscending = this[0] < this[this.length - 1]
        // Even with a custom sorter, the array can only be in ascending order
        // or descending order. It assumes the array is sorted so its considered
        // ascending if the first is lesser than the last, and vice versa. 

        while (min < max) {
            const mid = min + max >> 1
            const _value = this[mid]
            if (_value === value)
                return mid

            if (isAscending ? _value < value : _value > value)
                min = mid + 1
            else
                max = mid
        }

        return getClosest ? _max(min - 1, 0) : -1
    }

}

/*** Exports ***/

export default SortedArray

export {
    ascending,
    descending
}

export type {
    Sortable
}