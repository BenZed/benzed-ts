import { string } from './string'

it('validates strings', () => {
    expect(string('foo')).toEqual('foo')
})

it('trims', () => {

    const $string = string
        .dashCase()
        .trim()
        .startsWith('/')
        .contains('@')
        .asserts(str => str.charAt(5) !== '&', '6th characters cannot be ampersand', 'no-5th-&')

    console.log($string)

})