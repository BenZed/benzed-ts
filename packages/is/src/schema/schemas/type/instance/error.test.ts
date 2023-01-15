
import { Error } from './error'

//// Tests ////

const isError = new Error()

test('isError', () => {
    expect(isError(new Error()))
        .toEqual(true)

    expect(() => isError.validate(''))
        .toThrow('Must be type Error')
})

