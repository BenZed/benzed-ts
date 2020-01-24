import adjacent from './adjacent'
import { testOptionallyBindableMethod } from '../../dev/src'

testOptionallyBindableMethod(adjacent, (_adjacent: typeof adjacent) => {

    const array = ['a', 'b', 'c', 'd', 'e', 'f', 'g']

    it('returns an adjacent value of a given value and array', () => {
        expect(_adjacent(array, 'b')).toEqual('c')
    })

    it('adjacent value wraps around to the beginning if out of range', () => {
        expect(_adjacent(array, 'g')).toEqual('a')
    })

    it('returns first value in array if given value couldn\'t be found', () => {
        expect(_adjacent(array, '1')).toEqual('a')
    })

    it('works on numerical-length values', () => {
        const arrayLike = { length: 2, 0: 'a', 1: 'b' }

        expect(_adjacent(arrayLike, 'b')).toEqual('a')
        expect(_adjacent('string', 'r')).toEqual('i')
    })

    it('alternatively takes a delta argument', () => {
        expect(_adjacent(array, 'a', 2)).toEqual('c')
    })

    it('delta argument can be reverse', () => {
        expect(_adjacent(array, 'b', -3)).toEqual('f')
    })
})