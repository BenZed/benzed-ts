
import { isWeakMap } from './weak-map'

//// Tests ////

test('isWeakMap', () => {
    expect(isWeakMap(new WeakMap())) 
        .toEqual(true)

    expect(() => isWeakMap.validate(''))
        .toThrow('ust be type WeakMap') 
})

