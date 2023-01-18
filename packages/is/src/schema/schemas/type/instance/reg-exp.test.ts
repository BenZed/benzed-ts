
import { isRegExp } from './reg-exp'

//// Tests ////

test('isRegExp', () => {
    expect(isRegExp(/ace/))
        .toEqual(true)

    expect(() => isRegExp.validate(''))
        .toThrow('Must be type RegExp')
})

