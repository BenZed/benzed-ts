/***************************************************************/
// Types
/***************************************************************/

type Sortable = number | { valueOf(): number }

/***************************************************************/
// Helper
/***************************************************************/

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

/***************************************************************/
// Main
/***************************************************************/

class SortedArray<T extends Sortable> extends Array {

    public constructor(...params: T[]) {

        // initialize array with length
        super(params.length)

        // assign empty items
        for (let i = 0; i < this.length; i++)
            this[i] = params[i]

        this.sort()
    }

    public sort(): this {

        const { length } = this

        for (let i = 1; i < length; i++) {
            const item = this[i]

            let ii: number
            for (
                ii = i - 1;
                ii >= 0 && ascending(this[ii], item) > 0;
                ii--
            )
                this[ii + 1] = this[ii]

            this[ii + 1] = item
        }

        console.log('sorted')

        return this
    }

}

/***************************************************************/
// Exports
/***************************************************************/

export default SortedArray

export {
    ascending,
    descending
}