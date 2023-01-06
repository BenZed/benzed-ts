import { string } from './string'

it('validates strings', () => {
    expect(string('foo')).toEqual('foo')
})

it('trim()', () => {

    const $string = string
        .trim()

    expect($string(' ace ')).toEqual('ace')
    expect(() => $string.assert(' ace ')).toThrow('must not have whitespace')
})

it('upperCase()', () => {

    const $string = string.trim()
        .upperCase()
        .startsWith('ace')
        .endsWith('base')
        .contains('cunt')
        .contains('fart')

    console.log($string)

})