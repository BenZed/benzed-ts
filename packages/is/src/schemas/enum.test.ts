import { enumSchema } from './enum'

const traffic = enumSchema('green', 'red', 'yellow')

it('validates a union of primitives', () => {
    expect(traffic('green')).toEqual('green')
})

it('throws on bad options', () => {
    expect(() => traffic('blue')).toThrow('must be one of green, red or yellow')
})

it('supports bools, numbers, strings, null', () => {
    const enums = enumSchema(true, false, 0, 1, 'string', null)
    for (const value of [true, false, 0, 1, 'string', null])
        expect(enums(value)).toEqual(value)
})

it('options are available on schema', () => {
    expect(traffic.options).toEqual(['green', 'red', 'yellow'])
})
