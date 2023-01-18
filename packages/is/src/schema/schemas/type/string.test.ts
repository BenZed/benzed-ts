import { String } from './string'

const isString = new String()

it('validates strings', () => {
    expect(isString.validate('foo')).toEqual('foo')
})

it('trim()', () => {
    const isTrimmedString = isString.trim
    expect(isTrimmedString.validate(' ace ')).toEqual('ace')
    expect(() => isTrimmedString.assert(' ace ')).toThrow('must not begin or end with')
}) 

it('upperCase()', () => { 
 
    const isWeirdString = isString
        .trim
        .upperCase
        .startsWith('ace')
        .endsWith('base')
        .includes('case')
        .includes('face')  

    expect(isWeirdString.validate)
        .toHaveProperty('transforms')
})