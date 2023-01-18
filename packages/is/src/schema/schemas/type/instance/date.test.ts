
import { isDate } from './date'

//// Tests ////

test('isDate', () => {
    expect(isDate(new Date()))
        .toEqual(true)

    expect(() => isDate.validate(''))
        .toThrow('Must be type Date')
})

