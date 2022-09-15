import match from './index'

import { primes } from '@benzed/math'
import { isString, isBoolean, isNumber } from '@benzed/is'

/*** Tests ***/

/* eslint-disable @typescript-eslint/indent */

it('creates a match expression syntax', () => {

    const m1 = match(0)
        (0, 'zero')
        (1, 'one')
        (2, 'two')

    const [value] = m1

    expect(value).toBe('zero')
})

it('uses deep equality to compare value input cases', () => {

    const [fb] = match({ foo: 'bar' })
        ({ foo: 'baz' }, 'wrong')
        ({ foo: 'foo' }, 'wrong')
        ({ foo: 'bar' }, 'right')

    expect(fb).toEqual('right')
})

it('allows methods as input', () => {

    const matchDegrees = match(32 /*degrees*/)

    const [state] = matchDegrees
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
    ).toThrow('No match for value: a')

})

it('can iterate multiple values', () => {

    const m1 = match(0, 1, 2)
        .default(i => i * 10)

    expect([...m1]).toEqual([0, 10, 20])
})

it('can use type guards', () => {

    const expectBool = (input: boolean): string => `gottem: ${input}`

    const [, , f3] = match('ace', 2, true)
        (isBoolean, expectBool)
        .default('dont gottem')

    expect(f3).toEqual('gottem: true')
})

it('allows a single input to signify a default clause', () => {

    const m = match('ace', undefined)
        ('ace', 1)
        ('joker')

    expect([...m]).toEqual([1, 'joker'])
})

it('match.n helper', () => {

    const [...found] = match(0, 0, 0, 0)
        (match.n(1, 0), 'a')
        (match.n(2), 'b')
        .default(i => i)

    expect(found).toEqual(['a', 'b', 'b', 0])
})

it('match.after helper', () => {

    let iterations = 0
    let lastRandomNumber = 0
    function* randoms(): Generator<number> {
        while (true) {
            iterations++
            lastRandomNumber = Math.random()
            yield lastRandomNumber
        }
    }

    const [random] = match.each(randoms())
        (match.after(1000), i => `the thousandth random number is: ${i}`)
        .discard()

    expect(iterations).toEqual(1000)
    expect(random).toEqual(`the thousandth random number is: ${lastRandomNumber}`)

})

it('match.once helper', () => {

    const m = match(40, 79)
        (match.once(), i => i * 2)
        .default(i => `${i}`)

    expect([...m]).toEqual([80, '79'])
})

it('works on objects', () => {

    const [best] = match({ foo: 'bar' })
        (i => i.foo === 'bar', i => i)

    expect(best).toEqual({ foo: 'bar' })
})

it('subsequent calls will continue to iterate values until there are none left', () => {

    const m = match(1, 2, 3, 4)
        (1, 'one')
        (2, 'two')
        (3, 'three')
        (4, 'four')

    const [v1, v2] = m
    const [v3] = m
    const [v4] = m

    expect([v1, v2, v3, v4]).toEqual(['one', 'two', 'three', 'four'])

    expect(() => {
        const [error] = m
        void error
    }).toThrow('All values matched')
})

it('optional call signature takes an iterable', () => {

    const [...allPrimes] = match.each(primes(250))
        (i => i > 125, i => [i, 'primes-above-125'])
        (i => i <= 125, i => [i, 'primes-below-125'])

    expect(allPrimes).toHaveLength([...primes(250)].length)
})

it('.default() for verbose definition of default clause', () => {
    expect(
        match(1)
            .default(0)
            .next()
    ).toEqual(0)
})

it('.default() without argument just outputs whatever the input is', () => {
    expect(
        match(100)
            .default()
            .next()
    ).toEqual(100)
})

it('.default() correctly sorts arguments', () => {

    expect(
        match('true', false)
            (true, 'yes')
            (false, 'no')
            .default(undefined)
            .next()
    ).toEqual(undefined)

})

it('.break() for verbose definition of standard case', () => {
    expect(
        match(1)
            .break(1, 0)
            .next()
    ).toEqual(0)
})

it('.break() without an output argument just passes whatever the input is to the output', () => {
    expect(
        match(1)
            .break(1, 0)
            .next()
    ).toEqual(0)
})

it('.break() correctly sorts arguments', () => {
    expect(
        match(1)
            .break(1, undefined)
            .next()
    ).toEqual(undefined)
})

it('.fall() for cases that do not return, put pass their output to remaining cases', () => {

    const output = match('1', 2, '3', 4)
        .fall(isString, i => parseFloat(i))
        .default(i => i * 10)
        .rest()

    expect(output).toEqual([10, 20, 30, 40])
})

it(
    '.fall() is smart enough to adjust the remaining input to add output types ' +
    'and extract ones caught via type guards', () => {

        const output = match('1', 2, '3', 4, true)
            .fall(isString, parseFloat)
            .fall(isBoolean, i => i ? 1 : 0)
            .default(i => i * 10)
            //       ^ there should not be a type error here, because numbers
            //         are the only input type to remain
            .rest()

        expect(output).toEqual([10, 20, 30, 40, 10])
    })

it('.fall() can also accept a single input that becomes output', () => {

    const m = match(false, true, 79, 89)
        .fall(i => i === true ? 69 : i)
        .fall(i => i === false ? 0 : i)
        .fall(i => [(1 as number) + (i as number), '!'])
        .default(i => i.join(''))

    expect([...m]).toEqual(['1!', '70!', '80!', '90!'])
})

it('.fall() type def doesn\'t allow for non-function inputs', () => {
    // @ts-expect-error this would generally be a mistake 
    void match(10).fall(5)
})

it('.fall() can take non-function inputs, however', () => {
    expect(
        match(10).fall(5 as unknown as () => 5).default(i => i).next()
    ).toEqual(5)
})

it('.fall() correclty sorts arguments', () => {

    expect(
        match(undefined)
            .fall(i => i === undefined, undefined)
            .default(i => i)
            .next()
    ).toEqual(undefined)

})

it('.discard() prevents values from receiving an output', () => {

    const [...output] = match(0, 1, 2, 3, 4, true, 'string')
        .discard(isBoolean)
        .discard(isString)
        .default(i => i)

    expect(output).toEqual([0, 1, 2, 3, 4])
})

it('.discard() works with values', () => {

    const [...output] = match(3, 2, 1, 0, { foo: 'bar' }, 0, 1, 2, 3,)
        .discard({ foo: 'bar' })
        .discard(match.once(3))
        .discard(match.once(2))
        .discard(match.once(1))
        .discard(0)
        .fall(i => i * 2)
        .break(i => i > 0, i => i)

    expect(output).toEqual([2, 4, 6])

})

it('.discard() may not discard all values', () => {
    expect(() => match(0).discard(() => true).default(0).next())
        .toThrow('All values discarded.')
})

it('.discard() without output discards all values', () => {

    const [num] = match(true, true, true, true, true, 0, false)
        (isNumber, i => i)
        .discard()

    expect(num).toEqual(0)
})

it('.discard() properly sorts args', () => {

    const [num] = match(undefined, 1)
        .discard(undefined)
        .default()

    expect(num).toBe(1)
})

it('.keep() opposite of discard', () => {

    const strings = match(0, 1, 2, 3, true, false, 'hey', 'mommy')
        .keep(isString)
        .default(i => i.toUpperCase())
        .rest()

    expect(strings).toEqual(['HEY', 'MOMMY'])
})

it('.keep() throws without args', () => {

    // @ts-expect-error type expects an arg too
    expect(() => match(1).keep()).toThrow('Invalid signature, requires 1 parameters.')
})

it('handles infinite iterators', () => {

    const [prime] = match
        .each(primes(Infinity))
        .keep(i => i > 1000)
        .default(i => i)

    expect(prime).toEqual(1009)
})

it('match cannot be composed entirely of discard cases', () => {
    expect(() => match(0).discard(isBoolean).next())
        .toThrow('No output cases have been defined.')
})

it('a match composed only of fall cases throws', () => {
    const m = match(1).fall(i => i * 10)
    expect(() => m.next())
        .toThrow('No output cases have been defined.')
})

it('.next() to retreive the next output', () => {

    enum Status {
        IDLE,
        SUCCESS,
        ERROR
    }

    const getStatusMessage = (status: Status): string => match(status)
        (Status.IDLE, 'Download has not yet started')
        (Status.SUCCESS, 'Download succeeded')
        (Status.ERROR, 'Download Failed')
        .next()

    expect(getStatusMessage(Status.IDLE)).toEqual('Download has not yet started')
    expect(getStatusMessage(Status.SUCCESS)).toEqual('Download succeeded')
    expect(getStatusMessage(Status.ERROR)).toEqual('Download Failed')
})

it('.remaining() to retreive all remaining outputs', () => {

    const normalizeRanges = (...values: number[]): number[] =>
        match(...values)
            .fall(i => i < 0, i => -i)
            .break(i => i > 10, 10)
            .default()
            .rest()

    const values = normalizeRanges(-1, -11, 11, 5)

    expect(values).toEqual([1, 10, 10, 5])
})

it('throws if more attempts to add cases are made once the cases are finalized', () => {

    for (const finalMatchers of [
        match(0)(i => i),
        match(1)(1),
        match(2).default(i => i),
        match(3).default(3),
        match(4)(4, 4).finalize()
    ])
        // @ts-expect-error type is smart enough to know that the cases are complete
        expect(() => finalMatchers('ace')).toThrow('No more cases may be defined')

})

it('thrown errors do not impede further matching', () => {

    const m = match(1, 2, 0, 3)(
        0, () => {
            throw new Error('Can\'t divide by zero')
        })
        .default(i => i / 2)

    expect(() => [...m]).toThrow('Can\'t divide by zero')
    expect(m.next()).toEqual(1.5)

})

it('cannot finalize a match without cases', () => {
    // @ts-expect-error typescript knows that finalize() shouldn't be called without cases
    expect(() => match(0).finalize())
        .toThrow('No output cases have been defined.')
})

it('cases are required', () => {
    expect(() =>
        // @ts-expect-error typing is supposed to fail without cases
        [...match(0)]
    ).toThrow('No output cases have been defined')
})

it('iterator must have at least one value', () => {
    expect(() => match.each([])(i => i).next()).toThrow('No values to match.')
})

it('can match template strings', () => {

    const output = match.template`one:${1} two:${2} three:${true}`
        .fall(([, v]) => v)
        .default(v => v)
        .rest()

    expect([...output]).toEqual([1, 2, true])
})

