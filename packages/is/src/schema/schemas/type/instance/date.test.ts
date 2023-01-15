
import { Date } from './date'

//// Tests ////

const isDate = new Date()

test('isDate', () => {
    expect(isDate(new Date()))
        .toEqual(true)

    expect(() => isDate.validate(''))
        .toThrow('Must be type Date')
})

