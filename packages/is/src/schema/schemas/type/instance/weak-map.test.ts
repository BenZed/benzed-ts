
import { WeakMap } from './weak-map'

//// Tests ////

const isWeakMap = new WeakMap()

test('isRegExp', () => {
    expect(isWeakMap(new WeakMap()))
        .toEqual(true)

    expect(() => isWeakMap.validate(''))
        .toThrow('Must be type WeakMap')
})

