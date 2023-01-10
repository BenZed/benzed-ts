import { isSymbol } from './is-symbol'

import { nil } from '@benzed/util'

//// Tests ////

it('validates booleans', () => {
    expect(isSymbol(Symbol.iterator)).toEqual(true)
    expect(isSymbol(false)).toEqual(false)

    expect(() => isSymbol.validate('what'))
        .toThrow('Must be type symbol')  
})  

it('default()', () => {

    const $$default = Symbol('default')

    expect(isSymbol.default($$default)
        .validate(nil))
        .toBe($$default)
    
    expect(isSymbol.default(() => $$default)
        .validate(nil))
        .toBe($$default)
})
 