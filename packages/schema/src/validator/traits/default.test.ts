import Validator from '../validator'
import Default from './default'
import { testValidator } from '../../util.test'

//// Setup ////

const $string = new class String extends Validator<unknown, string> implements Default<unknown> {

    default(): string {
        return 'hello'
    }

}

//// Tests ////

describe(`${$string.name} validator tests`, () => {

    testValidator<unknown,string>(
        $string,

        { transforms: 'some string', output: 'some string' },
        { transforms: undefined, output: 'hello' }

    )
})

describe(`${Default.name} static property tests`, () => {

    test(`${Default.name} is method`, () => {
        expect(Default.is($string)).toBe(true)
        expect(Default.is({ default: () => undefined })).toBe(true)
        expect(Default.is({ default: 'invalid' })).toBe(false)
        expect(Default.is({})).toBe(false)
    })
})
