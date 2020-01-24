import unwrap from './unwrap'
import { testOptionallyBindableMethod } from '../../dev/src'

testOptionallyBindableMethod(unwrap, (_unwrap: typeof unwrap) => {

    it('ensures an input is not an array', () => {
        const obj = {}

        expect(_unwrap([obj])).toEqual(obj)
    })

    it('returns the input if it is not an array', () => {

        const obj = {}

        expect(_unwrap(obj)).toEqual(obj)
    })

})
