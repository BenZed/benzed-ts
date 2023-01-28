
import { isWeakSet } from './weak-set'

//// Tests ////

test('isWeakSet', () => {
    expect(isWeakSet(new WeakSet())) 
        .toEqual(true)

    expect(() => isWeakSet.validate(''))
        .toThrow('ust be type WeakSet') 
})

