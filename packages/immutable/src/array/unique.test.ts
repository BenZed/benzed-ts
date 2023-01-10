import copy from '../copy'
import unique from './unique'
import { $$equals } from '../equals'

describe('unique()', () => {

    it('outputs a copy of the input with non-duplicated values', () => {
        const array = [0, 0, 0, 1, 1, 1]
        const array2 = copy(array)
        const clone = unique(array2)

        // proves unique did not mutate array
        expect(array2).toEqual(array)

        // proves output is not same as input
        expect(clone).not.toBe(array)
    })

    describe('outputs a copy of the input with non-value-equal values', () => {

        const primitives = [0, -0, 1, 1, 'string', 'string', true, true, false, false]
        const pResults = [0, -0, 1, 'string', true, false]

        it('works on primitives', () => {

            expect(unique(primitives)).toEqual(pResults)
        })

        it('works on plain objects', () => {
            const foo = { foo: 'bar' }
            const baz = { foo: 'baz' }
            const cake1 = { cake: { town: true } }
            const cake2 = { cake: { town: false } }

            const objects = [cake2, foo, baz, cake1, foo, cake1, baz, cake2]
            expect(unique(objects)).toEqual([cake2, foo, baz, cake1])
        })

        class Foo {

            bar: unknown

            constructor (bar: unknown) {
                this.bar = bar
            }

            // eslint-disable-next-line
            public equals(b: unknown): b is this {
                return (b as Foo).bar === this.bar
            }

        }

        const foos = primitives.map(p => new Foo(p))

        it('works on objects with $$equals method', () => {
            expect(unique(foos).map(f => f.bar)).toEqual(pResults)
        })

        class UltraFoo extends Foo {
            [$$equals] = Foo.prototype.equals
        }

        const ultrafoos = primitives.map(p => new UltraFoo(p))

        it('works on objects with \'equals\' method', () => {
            expect(unique(ultrafoos).map(f => f.bar)).toEqual(pResults)
        })
    })

    it('does not mutate original array', () => {
        const array = [0, 0, 0, 1, 1, 1]
        const array2 = copy(array)

        const array3 = unique(array)

        // proves unique did not mutate array
        expect(array2).toEqual(array)

        // proves output is not same as input
        expect(array3).not.toBe(array)
    })

    it('works on array-likes', () => {

        const arraylike = {
            0: 'base',
            1: 'ace',
            length: 2
        }

        const clone = unique(arraylike)

        expect(clone).not.toBe(arraylike)
        expect(clone.length).toEqual(arraylike.length)
    })

})