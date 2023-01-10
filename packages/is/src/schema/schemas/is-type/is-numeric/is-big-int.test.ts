import { isBigInt } from './is-big-int'

it('is-big-int', () => {
    expect(isBigInt(0.5)).toBe(false)
    expect(isBigInt(0n)).toBe(true)
})