import { isBigInt } from './big-int'

it('big-int', () => {
    expect(isBigInt(0.5)).toBe(false)
    expect(isBigInt(0n)).toBe(true)
})