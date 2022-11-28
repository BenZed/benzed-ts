import { string } from './string'

it('validates strings', () => {
    expect(string('foo')).toEqual('foo')
})

it('trims', () => {

    const $string = string
        .trim()

    expect($string(' ace ')).toEqual('ace')
    expect(() => $string.assert(' ace ')).toThrow('must not have whitespace')
})

