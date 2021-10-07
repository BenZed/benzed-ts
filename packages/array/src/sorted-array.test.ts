import SortedArray from './sorted-array'

// eslint-disable-next-line no-unused-vars
/* global describe it  */

describe('Sorted Array', () => {

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

            public constructor(name: string, age: number) {
                this.name = name
                this.age = age
            }

            public valueOf(): number {
                return this.age
            }
        }

        const chuck = new Person('chuck', 15)
        const nick = new Person('nick', 30)
        const jake = new Person('jake', 31)
        const ben = new Person('ben', 32)
        const jimney = new Person('jimney', 35)
        const ebenezer = new Person('ebenezer', 98)

        it('sorts contents', () => {

            const arr = new SortedArray()
            arr.push(5)
            arr.push(3)
            arr.push(10)
            arr.push(2)
            arr.push(1)
            arr.push(0)

            arr.sort((a, b) => a.valueOf() - b.valueOf())

            expect(arr).toEqual([0, 1, 2, 3, 5, 10])
        })

        it('works with any object that provides a numerical valueOf', () => {

            const people = new SortedArray()
            people.push(nick, jake, ben, jimney, ebenezer, chuck)
            people.sort()

            expect(people).toEqual([chuck, nick, jake, ben, jimney, ebenezer])
        })

    })

    describe('map()', () => {

        it('does NOT sort output array', () => {

            class Body {

                public parent: Body | null

                public mass: number
                public valueOf(): number {
                    return this.mass
                }

                public constructor(mass: number, parent: Body | null = null) {
                    this.mass = mass
                    this.parent = parent
                }

            }

            const sun = new Body(4)
            const earth = new Body(3, sun)
            const moon = new Body(2, earth)
            const apollo = new Body(1, moon)

            const bodies = new SortedArray<Body>()
            bodies.push(apollo)
            bodies.push(earth)
            bodies.push(moon)
            // ^ using .push because we deliberatly want to map an unsorted array

            const children = bodies.map(body => body.parent)
            expect(children).toEqual([moon, sun, earth])
            // ^ if input array is out of order, the output array should be in
            // corresponding order

        })

    })

    describe('concat()', () => {

        it('does NOT sort output array', () => {

            const arr = new SortedArray<number>(0, 2, 4, 6)
            const concated = arr.concat([1, 7])

            expect(concated).toEqual([0, 2, 4, 6, 1, 7])
        })

    })

    describe('indexOf()', () => {

        const asc = new SortedArray<number>(1, 2, 2, 2, 3, 3, 4)
        const dsc = asc.copy().reverse()

        it('gets the first index of a value', () => {
            expect(asc.indexOf(2)).toEqual(1)
            expect(asc.indexOf(3)).toEqual(4)
        })

        it('get the first index of a value on a descending sorted array', () => {
            expect(dsc.indexOf(2)).toEqual(3)
            expect(dsc.indexOf(3)).toEqual(1)
        })

        it('returns -1 if value doesnt exist', () => {
            expect(asc.indexOf(100)).toEqual(-1)
            expect(dsc.indexOf(100)).toEqual(-1)
        })

    })

    describe('lastIndexOf()', () => {

        const asc = new SortedArray<number>(1, 2, 2, 2, 3, 3, 4)
        const dsc = asc.copy().reverse()

        it('gets the last index of a value', () => {
            expect(asc.lastIndexOf(2)).toEqual(3)
            expect(asc.lastIndexOf(3)).toEqual(5)
        })

        it('get the last index of a value on a descending sorted array', () => {
            expect(dsc.lastIndexOf(2)).toEqual(5)
            expect(dsc.lastIndexOf(3)).toEqual(2)
        })

        it('returns -1 if value doesnt exist', () => {
            expect(asc.lastIndexOf(100)).toEqual(-1)
        })

    })

    describe('unshift()', () => {

        const arr = new SortedArray<number>(3, 2, 0, 1)
        arr.unshift(10, 8, 10)

        it('adds items to beginning of array without sorting', () => {
            expect(arr).toEqual([10, 8, 10, 0, 1, 2, 3])
        })
    })

    describe('splice()', () => {
        const arr = new SortedArray<number>(3, 2, 0, 1)
        arr.splice(2, 0, 10, 8, 10)

        it('splices items into the array without sorting', () => {
            expect(arr).toEqual([0, 1, 10, 8, 10, 2, 3])
        })

    })

    describe('reverse()', () => {
        const arr = new SortedArray(2, 3, 1, 0)
        arr.reverse()

        it('reverses items in the array without sorting', () => {
            expect(arr).toEqual([3, 2, 1, 0])
        })

    })

    describe('copyWithin()', () => {
        const arr = new SortedArray(2, 3, 1, 0)
        arr.copyWithin(2, 0)

        it('copies within array without sorting', () => {
            expect(arr).toEqual([0, 1, 0, 1])
        })

    })

})
