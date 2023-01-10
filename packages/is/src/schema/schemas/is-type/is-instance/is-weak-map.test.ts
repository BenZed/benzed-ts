
import { IsWeakMap } from './is-weak-map'

//// Tests ////

const isWeakMap = new IsWeakMap()

test('isRegExp', () => {
    expect(isWeakMap(new WeakMap()))
        .toEqual(true)

    expect(() => isWeakMap.validate(''))
        .toThrow('Must be type WeakMap')
})

