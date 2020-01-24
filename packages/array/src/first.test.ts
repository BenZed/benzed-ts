import first from './first'
import { testOptionallyBindableMethod } from '../../dev/src'

testOptionallyBindableMethod(first, (_first: typeof first) => {

    it('returns the first element of an array', () => {
        expect(_first([1, 2, 3, 4, 5])).toEqual(1)
    })

    it('works on array-likes', () => {
        expect(_first('string')).toEqual('s')
        expect(_first({ 0: 'zero', length: 1 })).toEqual('zero')
    })

})