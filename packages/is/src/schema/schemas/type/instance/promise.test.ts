
import { isPromise } from './promise'

//// Tests ////

test('isPromise', () => {
    expect(isPromise(Promise.resolve())).toEqual(true)

    expect(() => isPromise.validate('')).toThrow('Must be type Promise')
})

