import { isString, isBoolean } from '../schema'
import { Or } from './or'

//// EsLint //// 

/* eslint-disable
    @typescript-eslint/ban-types
*/

//// Setup //// 

const isBoolOrString = new Or(isBoolean, isString) 

//// Tests ////
 
it('wraps other schematics', () => { 
    expect(isBoolOrString.types).toEqual([isBoolean, isString])
    expect(isBoolOrString(true)).toBe(true)
    expect(isBoolOrString('sup')).toBe(true)
})

it('inherits the schematic methods of the last type', () => {
    expect(isBoolOrString('')).toBe(true)
    expect(isBoolOrString(0)).toBe(false)
    expect(isBoolOrString.startsWith).toBeInstanceOf(Function)
})

it('cannot nest', () => { 
    expect(() => new Or(isBoolOrString))
        .toThrow(`Cannot contain other ${Or.name} instances`)
})

it('schematic methods that return a schematic are re-wrapped in Or', () => {
    const isBoolOrHash = isBoolOrString.startsWith('#')
    expect(isBoolOrHash('#hello')).toBe(true)
    expect(isBoolOrHash).toBeInstanceOf(Or)
    expect(isBoolOrHash.types[1]).not.toEqual(isBoolOrString.types[1])
}) 

it('schematic getters that return a schematic are re-wrapped in Or', () => {
    const isBoolOrTrimmed = isBoolOrString.trim
    expect(isBoolOrTrimmed(' a ')).toBe(false)
    expect(isBoolOrTrimmed('a')).toBe(true)
    expect(isBoolOrTrimmed(true)).toBe(true)
    expect(isBoolOrTrimmed.validate(' a ')).toBe('a')
    expect(isBoolOrTrimmed).toBeInstanceOf(Or)
    expect(isBoolOrTrimmed.types[1]).not.toEqual(isBoolOrString.types[1])
    expect(isBoolOrTrimmed.types[1]).toBeInstanceOf(String)
})