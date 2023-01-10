
import { IsRegExp } from './is-reg-exp'

//// Tests ////

const isRegExp = new IsRegExp()

test('isRegExp', () => {
    expect(isRegExp(/ace/))
        .toEqual(true)

    expect(() => isRegExp.validate(''))
        .toThrow('Must be type RegExp')
})

