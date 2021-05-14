/*** Types ***/

type Sortable = number | { valueOf(): number }

type Sorter<T extends Sortable> = (a: T, b: T) => number

/*** Helper ***/

function valueOf(sortable: Sortable): number {
    return typeof sortable === 'number'
        ? sortable
        : sortable.valueOf()
}

function ascending(a: Sortable, b: Sortable): number {
    return valueOf(a) - valueOf(b)
}

function descending(a: Sortable, b: Sortable): number {
    return valueOf(b) - valueOf(a)
}

function getIndexViaBinarySearch<T extends Sortable>(arr: T[], item: T): number {

    let min = 0
    let max = arr.length

    const ascending = arr[0] < arr[arr.length - 1]

    // Even with a custom sorter, the array can only be in ascending order
    // or descending order. It assumes the array is sorted so its ascending
    // if the first is lesser than the last, and vice versa. 

    const value = valueOf(item)

    while (min < max) {
        const mid = (min + max) >> 1
        const _item = arr[mid]
        const _value = valueOf(_item)

        if (_value === value)
            return mid

        if (ascending ? _value < value : _value > value)
            min = mid + 1
        else
            max = mid
    }

    return -1
}

/*** Main ***/
class SortedArray<T extends Sortable> extends Array<T> {

    public constructor(...params: T[]) {

        // initialize array with length
        super(params.length)

        // assign empty items
        for (let i = 0; i < this.length; i++)
            this[i] = params[i]

        this.sort()
    }

    public sort(sorter: Sorter<T> = ascending): this {

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

    public copy(): SortedArray<T> {

        const clone = new SortedArray<T>()

        for (let i = 0; i < this.length; i++)
            clone[i] = this[i]

        return clone
    }

    public lastIndexOf(value: T): number {

        let index = getIndexViaBinarySearch(this, value)

        // in case the array is in descending order
        while (this[index + 1] === value)
            index++

        return index
    }

    public indexOf(value: T): number {

        let index = getIndexViaBinarySearch(this, value)

        // in case the array is in ascending order
        while (this[index - 1] === value)
            index--

        return index
    }

    public reverse(): this {
        super.reverse.call(this)
        return this
    }

}

/*** Exports ***/

export default SortedArray

export {
    Sortable,
    Sorter,
    ascending,
    descending
}