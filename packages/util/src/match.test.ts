import match from './match'

/* eslint-disable @typescript-eslint/indent */

it('creates a match expression syntax', () => {

    const m1 = match(0)
        (0, 'zero')
        (1, 'one')
        (2, 'two')

    const [value] = m1

    expect(value).toBe('zero')

})

it('allows methods as input', () => {

    const [state] = match(32 /*degrees*/)
        (i => i < 0, 'ice')
        (i => i >= 0 && i < 100, 'water')
        (i => i >= 100, 'steam')

    expect(state).toBe('water')
})

it('allows for methods as output', () => {

    const [output] = match('a')
        (i => i.length === 1, o => o.repeat(5))

    expect(output).toBe('aaaaa')
})

it('throws if no matches', () => {

    expect(
        () => [...match('a')('b', 1)]
    ).toThrow('No match for a')

})

it('can iterate multiple values', () => {

    const m1 = match(0, 1, 2)
        (_ => true, i => i * 10)

    expect([...m1]).toEqual([0, 10, 20])
})

it('can use type guards', () => {

    const isBool = (input: unknown): input is boolean => typeof input === 'boolean'

    const expectBool = (input: boolean): string => `gottem: ${input}`

    const [, , f3] = match('ace', 2, true)
        (isBool, expectBool)
        (match.any, 'dont gottem')

    expect(f3).toEqual('gottem: true')
})

it('match.n helper', () => {

    const [one, two, three] = match(1, 1, 1)
        (match.n(1, 1), 'one')
        (match.once(1), 'two')
        (1, 'three')

    expect([one, two, three]).toEqual(['one', 'two', 'three'])

})

it('works on objects', () => {

    const [best] = match({ foo: 'bar' })
        (i => i.foo === 'bar', i => i)

    expect(best).toEqual({ foo: 'bar' })
})

it('types flow properly on ambigious inputs', () => {

    const [eighty] = match(40)(match.any, i => i * 2)
    //                                    ^ should not be a type error here 

    expect(eighty).toEqual(eighty)
})

it('cases are required', () => {

    expect(() =>
        // @ts-expect-error typing is supposed to fail without cases
        [...match(0)]
    ).toThrow('No cases have been defined')

})
