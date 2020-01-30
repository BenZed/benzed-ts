
/******************************************************************************/
// Data
/******************************************************************************/

const { defineProperty } = Object

/******************************************************************************/
// Symbols
/******************************************************************************/

const $$comparer = Symbol('compare-function')
const $$unsorted = Symbol('is-not-sorted')

/******************************************************************************/
// Helper
/******************************************************************************/

function ascending(a: number, b: number): 1 | 0 | -1 {
    return a > b
        ? 1
        : a < b
            ? -1
            : 0
}

function descending(a: number, b: number): 1 | 0 | -1 {
    return a > b
        ? -1
        : a < b
            ? 1
            : 0
}

function binarySearch(arr: T[], value: T, strict = true): T | undefined {

    let min = 0
    let max = arr.length

    // In case the array is descending
    const { ascending } = arr

    while (min < max) {
        const mid = (min + max) >> 1
        const _value = arr[mid]

        if (_value === value)
            return mid

        if (ascending ? _value < value : _value > value)
            min = mid + 1
        else
            max = mid
    }

    return strict === $$strict
        ? -1
        : min
}

function testUnsorted(arr, startIndex = 0, endIndex = arr.length - 1) {
    const { ascending } = arr

    let unsorted = false

    const length = endIndex - startIndex
    if (length <= 1)
        return

    for (let i = startIndex; i <= endIndex; i++) {
        const prev = arr[i - 1]
        const curr = arr[i]
        if (ascending ? curr < prev : curr > prev) {
            unsorted = true
            break
        }
    }

    arr[$$unsorted] = unsorted
}

/******************************************************************************/
// Errors
/******************************************************************************/

class UnsafeSortError extends Error {

    constructor(methodName: string) {
        super(`${methodName}() cannot be called on an SortedArray that is out of order. Call sort() before ${methodName}().`)
        this.name = 'UnsafeSortError'
    }

}

/******************************************************************************/
// Proxy
/******************************************************************************/

const PROXY_CONFIGURATION = {

    set<T>(array: T[], index: string | number, value: T) {

        const type = typeof index
        const i = type === 'string'
            ? parseInt(index)
            : NaN

        const { unsorted, length } = array

        const isSettingIndex = !Number.isNaN(i)
        if (isSettingIndex && !unsorted && length > 1) {
            const { ascending } = array
            const lastIndex = length - 1

            const next = array[i + 1]
            const prev = array[i - 1]
            if (i < lastIndex && (ascending ? value > next : value < next))
                array[$$unsorted] = true

            else if (i > 0 && (ascending ? value < prev : value > prev))
                array[$$unsorted] = true

            else if (i > length || i < 0)
                array[$$unsorted] = true
        }

        array[index] = value

        return true
    }
}

/******************************************************************************/
// Main
/******************************************************************************/

class SortedArray<T> extends Array {

    public constructor(...args: T[]) {

        super(...args)

        defineProperty(this, $$unsorted, { writable: true, value: false })
        defineProperty(this, $$comparer, { writable: true, value: ascending })

        this.sort()

        return new Proxy(this, PROXY_CONFIGURATION)
    }

    // Insertion Sort
    public sort(comparer): this {

        if (comparer)
            this.comparer = comparer

        const { length } = this

        // prevent extra proxy overhead when setting indexes
        this[$$unsorted] = true

        for (let i = 1; i < length; i++) {
            const item = this[i]

            // eslint-disable-next-line no-var
            for (var ii = i - 1; ii >= 0 && this.comparer(this[ii], item) > 0; ii--)
                this[ii + 1] = this[ii]

            this[ii + 1] = item
        }

        this[$$unsorted] = false

        return this
    }

    // Extended to return SortedArray

    public filter<T>(
        callback: (item: T, index: number, array: T[]) => boolean,
        thisArg: unknown
    ): SortedArray<T> {

        const filtered: SortedArray<T> = super.filter(callback, thisArg)
        filtered.comparer = this.comparer

        testUnsorted(filtered)

        return filtered
    }

    public map<T>(...args): SortedArray<T> {
        const mapped = super.map(...args)
        mapped.comparer = this.comparer

        testUnsorted(mapped)

        return mapped
    }

    public slice(...args) {
        const sliced = super.slice(...args)
        sliced.comparer = this.comparer

        testUnsorted(sliced)

        return sliced
    }

    public concat(arr) {
        const concated = super.concat(arr)
        concated.comparer = this.comparer

        const { unsorted } = this

        const cmax = concated.length - 1
        const tmax = this.length - 1

        if (!unsorted && cmax > tmax)
            testUnsorted(concated, tmax, cmax)

        return concated
    }

    // REQUIRES SAFE

    public lastIndexOf(value) {

        if (this[$$unsorted])
            throw new UnsafeSortError('lastIndexOf')

        const index = binarySearch(this, value, $$strict)
        return index
    }

    public indexOf(value) {

        if (this[$$unsorted])
            throw new UnsafeSortError('indexOf')

        let index = binarySearch(this, value, $$strict)

        // Search returns the last index of a given value, where indexOf should
        // return the first
        while (this[index - 1] === value)
            index--

        return index
    }

    // NEW METHODS

    public insert(value) {

        if (this[$$unsorted])
            throw new UnsafeSortError('insert')

        const index = binarySearch(this, value, null)

        // super.splice because this.splice will set unsorted, which is unecessary
        // because this function cannot pollute the order
        super.splice(index, 0, value)

        return index
    }

    public remove(value) {

        if (this[$$unsorted])
            throw new UnsafeSortError('remove')

        const index = binarySearch(this, value, $$strict)
        if (index > -1)
            // super.splice because this.splice will set unsorted, which is unecessary
            // because this function cannot pollute the order
            super.splice(index, 1)

        return index
    }

    // NEW PROPERTIES

    public get comparer() {
        return this[$$comparer]
    }

    public set comparer(compareFunc) {
        if (typeof compareFunc !== 'function')
            compareFunc = ascending

        this[$$comparer] = compareFunc
    }

    public get unsorted() {
        return this[$$unsorted]
    }

    public get ascending() {
        const { length } = this

        return length > 1 && this[0] < this[length - 1]
    }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default SortedArray

export {

    SortedArray, UnsafeSortError as UnsortedArrayError, $$unsorted,
    ascending, descending

}
