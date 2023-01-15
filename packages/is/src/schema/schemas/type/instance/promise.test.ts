
import { Promise } from './promise'

//// Tests ////

const isPromise = new Promise()

test('isPromise', () => {
    expect(isPromise(Promise.resolve())).toEqual(true)

    expect(() => isPromise.validate('')).toThrow('Must be type Promise')
})

