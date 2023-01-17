import { it } from '@jest/globals'

import Ref, { getSchematicExtensionDescriptors } from './ref'
import { isString, String, Schema } from '../../schema'
import { keysOf, nil } from '@benzed/util'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/
  
// @ts-expect-error it's abstract
const ref = new Ref(isString)

//// Tests //// 

it('wraps ref schematic methods', () => {

    const str = 'string'
 
    expect(ref(str)).toBe(true)
    expect(ref.is(str)).toBe(true)
    expect(ref.assert(str)).toBe(nil)
    expect(ref.validate(str)).toBe(str)
})

it('wraps ref in methods or gettings returning schematic', () => {
    const noTypeSupportAtThisLevelTho = ref as unknown as String
    const refTrim = noTypeSupportAtThisLevelTho.trim
    expect(refTrim).toBeInstanceOf(Ref)
 
    const refHashTag = noTypeSupportAtThisLevelTho.startsWith('#')
    expect(refHashTag).toBeInstanceOf(Ref)
})

it('survives copy', () => {

    const refCopy = ref.copy()
    const str = 'string'

    expect(refCopy(str)).toBe(true)
    expect(refCopy.is(str)).toBe(true)
    expect(refCopy.assert(str)).toBe(nil)
    expect(refCopy.validate(str)).toBe(str)
})

describe(getSchematicExtensionDescriptors.name + '()', () => { 

    it('gets all descriptors since schematic', () => {
        const descriptors = getSchematicExtensionDescriptors(Schema.prototype)
        expect(Array.from(keysOf(descriptors)))
            .toEqual(['validators', 'validates', 'asserts', 'transforms']) 
    }) 

    it('must extend schematic', () => {
        expect(() => getSchematicExtensionDescriptors(Array as any))
            .toThrow('does not extend Schematic')
    })
})