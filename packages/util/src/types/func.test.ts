import { isFunc } from './func'

test('isFunc()', () => {
    expect(isFunc(() => 'foo')).toBe(true)
})