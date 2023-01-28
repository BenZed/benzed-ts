
import { isError } from './error'

//// Tests ////

test('isError', () => {
    expect(isError(new Error())).toEqual(true)

    expect(() => isError.validate('')).toThrow('Must be type Error')
})

