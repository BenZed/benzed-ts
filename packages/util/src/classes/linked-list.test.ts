import { LinkedItem, LinkedList } from './linked-list'

//// Tests ////

it('is a collection of linked items', () => {

    const numbers = new LinkedList(1, 2, 3)

    expect(numbers.last.value).toEqual(3)
    expect(numbers.first.value).toEqual(1)
    expect(numbers.first.next).toEqual(numbers.last.prev)
})

it('first === last on lists with one item', () => {

    const numbers = new LinkedList<number>(1)

    expect(numbers.first.value).toEqual(1)
    expect(numbers.last.value).toEqual(1)
    expect(numbers.first).toBe(numbers.last)

    expect(numbers.first.next).toBe(null)
})

it('.append() to append items to the end of a list', () => {

    const numbers = new LinkedList<number>()
    const one = numbers.append(1)

    expect(numbers.first).toBe(one)
    expect(numbers.last).toBe(one)

    const two = numbers.append(2)
    expect(numbers.last).toBe(two)
    expect(numbers.first.next).toBe(two)
})

describe('.insert()', () => {

    it('splice items in at a given index', () => {

        const numbers = new LinkedList<string | number>(0, 1, 3, 4)
        numbers.insert(2, 2)

        // console.log(...numbers)
        expect(numbers.at(2))
            .toHaveProperty('value', 2)
    })

    it('can insert an empty list', () => {

        const numbers = new LinkedList<number>()
        numbers.insert(100, 0)
    })

    it('can insert at end of list', () => {

        const numbers = new LinkedList<number>(1, 2, 3, 4)
        numbers.insert(5, 4)

        expect(numbers.at(4))
            .toHaveProperty('value', 5)
    })

    it('index must be in range', () => {

        const numbers = new LinkedList<number>()

        for (const badIndex of [-1, 1]) {
            expect(

                () => numbers.insert(100, badIndex)

            ).toThrow('List is empty.')
        }
    })

    it('list item as insert argument', () => {

        const numbers = new LinkedList<number>(1)
        const three = numbers.append(3)

        numbers.insert(2, three)

        expect([...numbers.values()])
            .toEqual([1, 2, 3])
    })

    it('list item argument must actually be in the list', () => {

        const numbers1 = new LinkedList(1)
        const numbers2 = new LinkedList(2)

        const item = numbers1.at(0) as LinkedItem<number>

        expect(() => {
            numbers2.insert(3, item)
        }).toThrow('Item not in list')

    })
})

describe('remove', () => {

    it('removes items in list', () => {

        const numbers = new LinkedList(0, 1, 2, 2, 3, 4)

        const value = numbers.remove(2)

        expect([...numbers.values()]).toEqual([0, 1, 2, 3, 4,])
        expect(value).toEqual(2)

        expect(numbers).toHaveProperty('size', 5)
    })

    it('can remove first', () => {

        const numbers = new LinkedList(0, 1, 2)

        numbers.remove(0)

        expect([...numbers.values()]).toEqual([1, 2])
        expect(numbers.first).toHaveProperty('value', 1)
    })

    it('can remove last', () => {

        const numbers = new LinkedList(0, 1, 2)

        numbers.remove(2)

        expect([...numbers.values()]).toEqual([0, 1])
        expect(numbers.last).toHaveProperty('value', 1)
    })

    it('can use list items instead of indices', () => {

        const numbers = new LinkedList(0, 1, 2)

        const second = numbers.at(1)

        numbers.remove(second as LinkedItem<number>)

        expect([...numbers.values()]).toEqual([0, 2])
    })

    it('removed items are no longer linked', () => {

        const numbers = new LinkedList(0, 1, 2)

        const second = numbers.at(1)

        expect(second?.next).not.toBeNull()
        expect(second?.prev).not.toBeNull()

        numbers.remove(1)

        expect(second?.next).toBeNull()
        expect(second?.prev).toBeNull()
    })

    it('remove with no input removes the last item on the list', () => {
        const numbers = new LinkedList(1, 2)

        const two = numbers.remove()

        expect(two).toBe(2)
    })

})

it('clear() to empty a list', () => {

    const numbers = new LinkedList(1, 2, 3)

    const values = numbers.clear()

    expect(values).toEqual([1, 2, 3])
    expect(numbers.size).toBe(0)

})

describe('at()', () => {

    const values = [1, 2, 3, 4, 5]
    const numbers = new LinkedList(...values)

    it('gets list items at index', () => {
        for (const value of values) {
            const index = value - 1

            expect(numbers.at(index)).toHaveProperty('value', value)
        }
    })

    it('null if index out of range', () => {
        expect(numbers.at(10)).toEqual(null)
    })

    it('negative indices are from end', () => {
        expect(numbers.at(-1)).toHaveProperty('value', values.at(-1))
    })
})

describe('iteration', () => {

    const values = [1, 2, 3, 4, 5]
    const numbers = new LinkedList(...values)

    it('iterate items', () => {
        expect([...numbers].map(i => i.value)).toEqual(values)
    })

    it('iterate items via .items()', () => {
        expect([...numbers.items()].map(i => i.value)).toEqual(values)
    })

    it('iterate values via .values()', () => {
        expect([...numbers.values()]).toEqual(values)
    })

    it('iterate entries via .entries()', () => {
        expect(
            [
                ...numbers.entries()
            ].map(
                ([{ value }, index]) => ({ value, index })
            )
        ).toEqual(
            values.map(
                (value, index) => ({ value, index })
            )
        )
    })
})

describe('LinkedList.from', () => {

    it('creates linked lists from iterables', () => {

        const linkedList = LinkedList.from(
            ['hey', 'ho']
        )

        expect([...linkedList.values()])
            .toEqual(['hey', 'ho'])
    })

    it('creates linked lists from arraylikes', () => {

        const linkedList = LinkedList.from(
            { length: 2, 0: true, 1: false }
        )

        expect([...linkedList.values()])
            .toEqual([true, false])
    })

})

it('indexOf()', () => {

    const vector1 = { x: 1 }
    const vector2 = { x: 2 }

    const vectors = new LinkedList(vector1, vector2)

    expect(vectors.indexOf(vector1)).toBe(0)
    expect(vectors.indexOf(vector2)).toBe(1)
})