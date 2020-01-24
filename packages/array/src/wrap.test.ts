import wrap from './wrap'
import { testOptionallyBindableMethod } from '../../dev/src'

// eslint-disable-next-line no-unused-vars

testOptionallyBindableMethod(wrap, (_wrap: typeof wrap) => {

    it('ensures an input is an array', () => {

        expect(_wrap(5)).toBeInstanceOf(Array)
        expect(_wrap(5)).toEqual([5])
    })

    it('returns the input if it is an array', () => {

        const arr = [1]

        expect(_wrap(arr)).toEqual(arr)
    })

})