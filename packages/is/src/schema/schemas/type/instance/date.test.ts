
import { IsDate } from './date'

//// Tests ////

const isDate = new IsDate()

test('isDate', () => {
    expect(isDate(new Date()))
        .toEqual(true)

    expect(() => isDate.validate(''))
        .toThrow('Must be type Date')
})

