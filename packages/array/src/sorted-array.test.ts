import SortedArray, { ascending, descending } from './sorted-array'

// eslint-disable-next-line no-unused-vars
/* global describe it  */

describe.only('Sorted Array', () => {

    it('extends Array', () => {
        expect(new SortedArray()).toBeInstanceOf(Array)
    })


    describe('constructor()', () => {
        it('sorts provided arguments', () => {
            const arr = new SortedArray(4, 2, 3, 5, 1, 6, 0)
            expect([...arr]).toEqual([0, 1, 2, 3, 4, 5, 6])
        })
    })

    describe('sort()', () => {

        class Person {

            public name: string
            public age: number

            constructor(name: string, age: number) {
                this.name = name
                this.age = age
            }

            valueOf(): number {
                return this.age
            }
        }

        const chuck = new Person('chuck', 15)
        const nick = new Person('nick', 30)
        const jake = new Person('jake', 31)
        const ben = new Person('ben', 32)
        const jimney = new Person('jimney', 35)
        const ebenzer = new Person('ebenezer', 98)

        it.only('sorts contents', () => {

            const arr = new SortedArray()
            arr.push(5)
            arr.push(3)
            arr.push(10)
            arr.push(2)
            arr.push(1)
            arr.push(0)

            arr.sort()

            console.log(arr)
            expect(arr).toEqual([0, 1, 2, 3, 5, 10])
        })

        it('sets unsorted flag to false', () => {

            const arr = new SortedArray()
            arr.push(5, 3, 6)

            expect(arr).toHaveProperty('unsorted', true)
            expect(arr).toEqual([5, 3, 6])

            arr.sort()
            expect(arr).toEqual([3, 5, 6])
            expect(arr).toHaveProperty('unsorted', false)

        })

        it('works with any object that provides a numerical valueOf', () => {

            const people = new SortedArray(ebenzer, ben, nick, jimney, chuck, jake)

            expect(people).toEqual([chuck, nick, jake, ben, jimney, ebenzer])
        })

        // describe('compare sorting functions', () => {

        //     const people = new SortedArray(ebenzer, ben, nick, jimney, chuck, jake)

        //     beforeAll(() => people.sort(descending))

        //     it('allows custom sorting', () => {
        //         expect(people).toEqual([ebenzer, jimney, ben, jake, nick, chuck])
        //     })

        //     it('passing in a custom sorter sets comparer property', () => {
        //         expect(people.comparer).toEqual(descending)
        //     })

        //     it('indexOf() returns correct indexes on custom sorted arrays', () => {
        //         expect(people.indexOf(ben)).toEqual(2)
        //     })

        //     it('lastIndexOf() returns correct indexes on custom sorted arrays', () => {
        //         expect(people.indexOf(jake)).toEqual(3)
        //     })

        //     it('insert() places items correctly into custom sorted arrays', () => {
        //         const pCopy = new SortedArray(...people)
        //         pCopy.sort(descending)

        //         const stew = new Person('stewie', 8)
        //         // expect(pCopy.insert(stew)).toEqual(6)
        //         expect(pCopy.indexOf(stew)).toEqual(6)
        //     })

        //     it('remove() correctly removes items from custom sorted arrays', () => {
        //         const pCopy = new SortedArray(...people)
        //         pCopy.sort(descending)

        //         // expect(pCopy.remove(ben)).toEqual(2)
        //         expect(pCopy.indexOf(ben)).toEqual(-1)
        //     })
        // })
    })

    /*

    describe('filter()', () => {
        const arr = new SortedArray(8, 4, 1, 0, 9, 12, 13, 8, 17, 5)
        const filtered = arr.filter(n => n % 2 === 0)

        it('filters contents via function', () => {
            expect(filtered).toEqual([0, 4, 8, 8, 12])
        })

        it('returns a SortedArray', () => {
            expect(filtered).toBeInstanceOf(SortedArray)
        })

        it('filtree gets tested for sort', () => {
            const arr2 = arr.filter(() => true)
            arr2[1] = 100

            const arr3 = arr2.filter(v => v % 2 === 0)
            const arr4 = arr2.filter(v => v < 100)

            expect(arr2.unsorted).toEqual(true)
            expect(arr3.unsorted).toEqual(true)
            expect(arr4.unsorted).toEqual(false)
        })

        it('custom comparers are passed to filtered arrays', () => {
            const arr2 = new SortedArray(...arr)
            arr2.sort(descending)

            const filtered2 = arr2.filter(n => n < 8)
            expect(filtered2.comparer).toEqual(arr2.comparer)
            expect(filtered2).toEqual([5, 4, 1, 0])
        })
    })

    describe('slice', () => {

        const arr = new SortedArray(0, 1, 2, 3, 4, 5)

        const sliced = arr.slice(1, 4)

        it('inherits Array.prototype.slice functionality', () => {
            expect(sliced).toEqual([1, 2, 3])
        })

        it('slicee tests for unsorted', () => {

            const arr2 = new SortedArray(...arr)
            arr2[0] = 100

            const arr3 = arr2.slice(0, 4)
            const arr4 = arr2.slice(1, 4)

            expect(arr2.unsorted).toEqual(true)
            expect(arr3.unsorted).toEqual(true)
            expect(arr4.unsorted).toEqual(false)
            expect(sliced.unsorted).toEqual(false)
        })

        it('returns a SortedArray', () => {
            expect(sliced).toBeInstanceOf(SortedArray)
        })

    })

    describe('map()', () => {
        const arr = new SortedArray(4, 16, 25, 36, 49, 64)
        const mapped = arr.map(Math.sqrt)

        it('maps contents via function', () => {
            expect(mapped).toEqual([2, 4, 5, 6, 7, 8])
        })

        it('returns a SortedArray', () => {
            expect(mapped).toBeInstanceOf(SortedArray)
        })

        it('tests result array for unsorted', () => {
            const mappedunsorted = arr.map(v => v % 2 === 0 ? v * 100 : v)
            expect(arr.unsorted).toEqual(false)
            expect(mapped.unsorted).toEqual(false)
            expect(mappedunsorted.unsorted).toEqual(true)
        })

        it('custom comparers are passed to mapped arrays', () => {
            const arr2 = new SortedArray(...arr)
            arr2.sort(descending)

            const mapped2 = arr2.map(Math.sqrt)
            expect(mapped2.comparer).toEqual(arr2.comparer)
            expect(mapped2).toEqual([8, 7, 6, 5, 4, 2])
        })
    })

    describe('concat()', () => {

        const arr = new SortedArray(0, 2, 4, 6)
        const concated = arr.concat([1, 7])

        it('merges two arrays', () => {
            expect(concated).toEqual([0, 2, 4, 6, 1, 7])
        })

        it('returns a SortedArray', () => {
            expect(concated).toBeInstanceOf(SortedArray)
        })

        it('sets unsorted flag on returned array', () =>
            expect(concated.unsorted).toEqual(true)
        )

    })

    describe('lastIndexOf()', () => {

        const arr = new SortedArray(1, 2, 2, 2, 3, 3, 4)

        it('Gets the last index of a value', () => {
            expect(arr.lastIndexOf(2)).toEqual(3)
            expect(arr.lastIndexOf(3)).toEqual(5)
        })

        it('throws if array is unsorted', () => {
            const arr = new SortedArray(4, 5)
            arr.push(0)
            expect(() => arr.indexOf(0)).toThrow(UnsafeSortError)
        })

        it('returns -1 if value doesnt exist', () => {
            expect(arr.lastIndexOf(100)).toEqual(-1)
        })

    })

    describe('indexOf()', () => {

        const arr = new SortedArray(1, 2, 2, 2, 3, 3, 4)

        it('Gets the first index of a value', () => {
            expect(arr.indexOf(2)).toEqual(1)
            expect(arr.indexOf(3)).toEqual(4)
        })

        it('throws if array is unsorted', () => {
            const arr = new SortedArray(4, 5)

            arr.push(0)

            expect(() => arr.indexOf(0)).toThrow(UnsafeSortError)
        })

        it('returns -1 if value doesnt exist', () => {
            expect(arr.indexOf(100)).toEqual(-1)
        })

    })

    describe('insert()', () => {

        const arr = new SortedArray(0, 1, 2, 3, 5, 6, 7, 8)
        const index = arr.insert(4)

        it('inserts a value into it\'s sorted location', () => {
            expect(arr.indexOf(4)).toEqual(4)
        })

        it('throws if array is unsorted', () => {
            const arr = new SortedArray(0, 5)
            arr.push(3)
            expect(() => arr.insert(2)).toThrow(UnsafeSortError)
        })

        it('returns index of placed location', () => {
            expect(index).toEqual(arr.indexOf(4))
        })

    })

    describe('remove()', () => {

        const arr = new SortedArray(0, 1, 2, 3, 4, 5, 6, 7, 8)
        const index = arr.remove(4)

        it('removes a value', () => {
            expect(arr.indexOf(4)).toEqual(-1)
        })

        it('throws if array is unsorted', () => {
            const arr = new SortedArray(1, 2, 3)
            arr.push(0)
            expect(() => arr.remove(1)).toThrow(UnsafeSortError)
        })

        it('returns index of removed location', () => {
            expect(index).toEqual(4)
        })

    })

    describe('push()', () => {

        const arr = new SortedArray(3, 2, 0, 1)
        arr.push(10, 8, 10)

        it('adds items to end of array without sorting', () => {
            expect(arr).toEqual([0, 1, 2, 3, 10, 8, 10])
        })

        it('sets unsorted flag to true if pushes leave array out of order', () =>
            expect(arr.unsorted).toEqual(true)
        )

        const arr2 = new SortedArray(0, 1, 2, 3, 4)
        arr2.push(5, 6, 7)

        it('doesnt set unsorted if array pushes are not out of order', () =>
            expect(arr2.unsorted).toEqual(false)
        )
    })

    describe('unshift()', () => {

        const arr = new SortedArray(3, 2, 0, 1)
        arr.unshift(10, 8, 10)

        it('adds items to beginning of array without sorting', () => {
            expect(arr).toEqual([10, 8, 10, 0, 1, 2, 3])
        })

        it('sets unsorted flag to true', () =>
            expect(arr.unsorted).toEqual(true)
        )
    })

    describe('splice()', () => {
        const arr = new SortedArray(3, 2, 0, 1)
        arr.splice(2, 0, 10, 8, 10)

        it('inherits Array.prototype.splice functionality', () => {
            expect(arr).toEqual([0, 1, 10, 8, 10, 2, 3])
        })

        it('sets unsorted flag to true', () =>
            expect(arr.unsorted).toEqual(true)
        )
    })

    describe('reverse()', () => {
        const arr = new SortedArray(2, 3, 1, 0)
        arr.reverse()

        it('inherits Array.prototype.reverse functionality', () => {
            expect(arr).toEqual([3, 2, 1, 0])
        })

        it('sets unsorted flag to true', () =>
            expect(arr.unsorted).toEqual(true)
        )
    })

    describe('copyWithin()', () => {
        const arr = new SortedArray(2, 3, 1, 0)
        arr.copyWithin(2, 0)

        it('inherits Array.prototype.reverse functionality', () => {
            expect(arr).toEqual([0, 1, 0, 1])
        })

        it('sets unsorted flag to true', () =>
            expect(arr.unsorted).toEqual(true)
        )
    })

    describe('.unsorted', () => {
        it('is read only', () => {
            const arr = new SortedArray(0, 1, 2, 3)
            expect(() => { arr.unsorted = true }).toThrow('has only a getter')
        })
    })

    describe('ascending', () => {
        it('is read only', () => {
            const arr = new SortedArray(0, 1, 2, 3)
            expect(() => { arr.ascending = true }).toThrow('has only a getter')
        })

        it('is true if array is ascending', () => {

            const arr1 = new SortedArray(0, 1, 2, 3, 4)
            const arr2 = new SortedArray(5, 6, 7, 8, 9)

            arr2.comparer = descending
            arr2.sort()

            expect(arr1.ascending).toEqual(true)
            expect(arr2.ascending).toEqual(false)

        })
    })

    describe('Symbol(\'compare-function\') pr\'Symbol(\'compare-function\') property enumerable', () => {
        const arr = new SortedArray(1, 2, 3, 4)
        const [COMPARER] = Object.getOwnPropertySymbols(arr)

        for (const key in arr)
            if (key === COMPARER)
                throw new Error(`${COMPARER} should not be enumerable.`)
    })
})

describe('sortedArray[i] = value', () => {

    it('sets unsorted if placed value puts array out of order', () => {
        const arr = new SortedArray(4, 8, 1, 4, 0, 11)

        arr[2] = 5

        return expect(arr.unsorted).toEqual(true)

    })

    */
})
