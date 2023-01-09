
import { IsError } from './is-error'

//// Tests ////

const isError = new IsError()

test('isError', () => {
    expect(isError(new Error()))
        .toEqual(true)

    expect(() => isError.validate(''))
        .toThrow('Must be type Error')
})

