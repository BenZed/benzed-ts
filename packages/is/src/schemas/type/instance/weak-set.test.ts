
import { $weakset } from './weak-set'

//// Tests ////

test('isWeakSet', () => {
    expect($weakset(new WeakSet())) 
        .toEqual(true)

    expect(() => $weakset.validate(''))
        .toThrow('ust be WeakSet') 
})

