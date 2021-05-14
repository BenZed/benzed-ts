import unique from './unique'
import { inspect } from 'util'

describe('returns an array of input without duplicate elements', () => {

    it('[0,0,1,1,2,2,3,3] >> [0,1,2,3]', () => {
        const arr = [0, 0, 1, 1, 2, 2, 3, 3]
        const arr2 = unique(arr)

        expect(arr2).toEqual([0, 1, 2, 3])
    })

    it('[Function, Function, Object, Object] >> [Function, Object]', () => {

        const arr = [Function, Function, Object, Object]
        const arr2 = unique(arr)

        expect(arr2).toHaveLength(2)
        expect(arr2[0]).toEqual(Function)
        expect(arr2[1]).toEqual(Object)
    })

})

describe('works on numerical-length values', () => {

    const obj: ArrayLike<string> = {
        0: 'one',
        1: 'one',
        length: 2
    }

    it(`${inspect('foobar')} >> ['f','o','b','a','r']`, () => {
        const str = 'foobar'
        expect(unique(str).join('')).toEqual('fobar')
    })

    it(`${inspect(obj)} >> ['one']`, () => {
        expect(unique(obj)).toEqual(['one'])
    })

})

describe('works on iterables', () => {

    const map = new Map([[0, 'one'], [1, 'one'], [2, 'one']])

    it(`(${inspect(map)}).values() >> [ 'one' ]`, () => {
        expect(unique(map.values())).toEqual(['one'])
    })

    const custom = {
        *[Symbol.iterator](
            this: Readonly<{ [key: string]: string }>
        ) {
            for (const key in this)
                yield this[key]
        },
        foo: 'bar',
        baz: 'bar'
    }

    it('{foo: \'bar\', baz: \'bar\', @@iterator} >> [\'bar\']', () => {
        expect(unique(custom)).toEqual(['bar'])
    })

})

