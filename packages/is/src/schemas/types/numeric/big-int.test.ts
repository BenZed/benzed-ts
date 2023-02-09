import { $bigint } from './big-int'

it('big-int', () => {
    expect(() => $bigint(0.5)).toThrow('Must be bigint')
    expect($bigint(0n)).toBe(0n)
})