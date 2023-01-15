
import { RegExp } from './reg-exp'

//// Tests ////

const isRegExp = new RegExp()

test('isRegExp', () => {
    expect(isRegExp(/ace/))
        .toEqual(true)

    expect(() => isRegExp.validate(''))
        .toThrow('Must be type RegExp')
})

