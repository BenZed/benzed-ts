import { IsEnum } from './enum'

const traffic = new IsEnum('green', 'red', 'yellow')

it('validates a union of primitives', () => {
    expect(traffic.validate('green')).toEqual('green')
})   
 
it('throws on bad options', () => { 
    expect(() => traffic.validate('blue')).toThrow('must be one of green, red or yellow')
})

it('supports bools, numbers, strings, null', () => {
    const enums = new IsEnum(true, false, 0, 1, 'string', null)
    for (const value of [true, false, 0, 1, 'string', null]) 
        expect(enums.validate(value)).toEqual(value)
})

it('options are available on schema', () => {
    expect(traffic.options).toEqual(['green', 'red', 'yellow'])
})
