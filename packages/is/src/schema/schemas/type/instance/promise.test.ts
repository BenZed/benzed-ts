
import { IsPromise } from './promise'

//// Tests ////

const isPromise = new IsPromise()

test('isPromise', () => {
    expect(isPromise(Promise.resolve())).toEqual(true)

    expect(() => isPromise.validate('')).toThrow('Must be type Promise')
})

