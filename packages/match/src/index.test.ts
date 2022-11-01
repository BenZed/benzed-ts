import match from './index'

import { primes } from '@benzed/math'
import is from '@benzed/is'
import { toTrue } from '@benzed/util'

//// Tests ////

/* eslint-disable @typescript-eslint/indent */

it(`creates a match expression syntax`, () => {

    const m1 = match(0)
        (0, `zero`)
        (1, `one`)
        (2, `two`)

    const [value] = m1

    expect(value).toBe(`zero`)
})

it(`uses deep equality to compare value input cases`, () => {

    const [fb] = match({ foo: `bar` } as { foo: `bar` | `baz` | `foo` })
        ({ foo: `foo` }, `wrong`)
        ({ foo: `baz` }, `wrong`)
        ({ foo: `bar` }, `right`)

    expect(fb).toEqual(`right`)
})

it(`allows methods as input`, () => {

    const matchDegrees = match(32 /*degrees*/)

    const [state] = matchDegrees
        (i => i < 0, `ice`)
        (i => i >= 0 && i < 100, `water`)
        (i => i >= 100, `steam`)

    expect(state).toBe(`water`)
})

it(`allows for methods as output`, () => {

    const [output] = match(`a`)
        (i => i.length === 1, o => o.repeat(5))

    expect(output).toBe(`aaaaa`)
})

it(`throws if no matches`, () => {

    expect(
        () => [...match(`a`)(`b`, 1)]
    ).toThrow(`No match for value: a`)

})

it(`can iterate multiple values`, () => {

    const m1 = match(0, 1, 2)
        .default(i => i * 10)

    expect([...m1]).toEqual([0, 10, 20])
})

it(`can use type guards`, () => {

    const expectBool = (input: boolean): string => `gottem: ${input}`

    const [, , f3] = match(`ace`, 2, true)
        (is.boolean, expectBool)
        .default(`dont gottem`)

    expect(f3).toEqual(`gottem: true`)
})

it(`allows a single input to signify a default clause`, () => {

    const m = match(`ace`, undefined)
        (`ace`, 1)
        (`joker`)

    expect([...m]).toEqual([1, `joker`])
})

it(`match.n helper`, () => {

    const [...found] = match(0, 0, 0, 0)
        (match.n(1, 0), `a`)
        (match.n(2), `b`)
        .default(i => i)

    expect(found).toEqual([`a`, `b`, `b`, 0])
})

it(`match.after helper`, () => {

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

it(`match.once helper`, () => {

    const m = match(40, 79)
        (match.once(), i => i * 2)
        .default(i => `${i}`)

    expect([...m]).toEqual([80, `79`])
})

it(`works on objects`, () => {

    const [best] = match({ foo: `bar` })
        (i => i.foo === `bar`, i => i)

    expect(best).toEqual({ foo: `bar` })
})

it(`subsequent calls will continue to iterate values until there are none left`, () => {

    const m = match(1, 2, 3, 4)
        (1, `one`)
        (2, `two`)
        (3, `three`)
        (4, `four`)

    const [v1, v2] = m
    const [v3] = m
    const [v4] = m

    expect([v1, v2, v3, v4]).toEqual([`one`, `two`, `three`, `four`])

    expect(() => {
        const [error] = m
        void error
    }).toThrow(`All values matched`)
})

it(`optional call signature takes an iterable`, () => {

    const [...allPrimes] = match.each(primes(250))
        (i => i > 125, i => [i, `primes-above-125`])
        (i => i <= 125, i => [i, `primes-below-125`])

    expect(allPrimes).toHaveLength([...primes(250)].length)
})

it(`.default() for verbose definition of default clause`, () => {
    expect(
        match(1)
            .default(0)
            .next()
    ).toEqual(0)
})

it(`.default() without argument just outputs whatever the input is`, () => {
    expect(
        match(100)
            .default()
            .next()
    ).toEqual(100)
})

it(`.default() correctly sorts arguments`, () => {

    expect(
        match(`true`, false)
            (true, `yes`)
            (false, `no`)
            .default(undefined)
            .next()
    ).toEqual(undefined)

})

it(`.break() for verbose definition of standard case`, () => {
    expect(
        match(1)
            .break(1, 0)
            .next()
    ).toEqual(0)
})

it(`.break() without an output argument just passes whatever the input is to the output`, () => {
    expect(
        match(1)
            .break(1, 0)
            .next()
    ).toEqual(0)
})

it(`.break() correctly sorts arguments`, () => {
    expect(
        match(1)
            .break(1, undefined)
            .next()
    ).toEqual(undefined)
})

it(`.fall() for cases that do not return, put pass their output to remaining cases`, () => {

    const output = match(`1`, 2, `3`, 4)
        .fall(is.string, i => parseFloat(i))
        .default(i => i * 10)
        .rest()

    expect(output).toEqual([10, 20, 30, 40])
})

it(
    `.fall() is smart enough to adjust the remaining input to add output types ` +
    `and extract ones caught via type guards`, () => {

        const output = match(`1`, 2, `3`, 4, true)
            .fall(is.string, parseFloat)
            .fall(is.boolean, i => i ? 1 : 0)
            .default(i => i * 10)
            //       ^ there should not be a type error here, because numbers
            //         are the only input type to remain
            .rest()

        expect(output).toEqual([10, 20, 30, 40, 10])
    })

it(`.fall() can also accept a single input that becomes output`, () => {

    const m = match(false, true, 79, 89)
        .fall(i => i === true ? 69 : i)
        .fall(i => i === false ? 0 : i)
        .fall(i => [(1 as number) + (i as number), `!`])
        .default(i => i.join(``))

    expect([...m]).toEqual([`1!`, `70!`, `80!`, `90!`])
})

it(`.fall() type def doesn't allow for non-function inputs`, () => {
    // @ts-expect-error this would generally be a mistake 
    void match(10).fall(5)
})

it(`.fall() can take non-function inputs, however`, () => {
    expect(
        match(10).fall(5 as unknown as () => 5).default(i => i).next()
    ).toEqual(5)
})

it(`.fall() correclty sorts arguments`, () => {

    expect(
        match(undefined)
            .fall(i => i === undefined, undefined)
            .default(i => i)
            .next()
    ).toEqual(undefined)

})

it(`.discard() prevents values from receiving an output`, () => {

    const [...output] = match(0, 1, 2, 3, 4, true, `string`)
        .discard(is.boolean)
        .discard(is.string)
        .default(i => i)

    expect(output).toEqual([0, 1, 2, 3, 4])
})

it(`.discard() works with values`, () => {

    const [...output] = match(3, 2, 1, 0, { foo: `bar` }, 0, 1, 2, 3,)
        .discard({ foo: `bar` })
        .discard(match.once(3))
        .discard(match.once(2))
        .discard(match.once(1))
        .discard(0)
        .fall(i => i * 2)
        .break(i => i > 0, i => i)

    expect(output).toEqual([2, 4, 6])
})

it(`.discard() may not discard all values`, () => {
    expect(() => match(0).discard(toTrue).default(0).next())
        .toThrow(`All values discarded.`)
})

it(`.discard() without output discards all values`, () => {

    const [num] = match(true, true, true, true, true, 0, false)
        (is.number, i => i)
        .discard()

    expect(num).toEqual(0)
})

it(`.discard() properly sorts args`, () => {

    const [num] = match(undefined, 1)
        .discard(undefined)
        .default()

    expect(num).toBe(1)
})

it(`.keep() opposite of discard`, () => {

    const strings = match(0, 1, 2, 3, true, false, `hey`, `mommy`)
        .keep(is.string)
        .default(i => i.toUpperCase())
        .rest()

    expect(strings).toEqual([`HEY`, `MOMMY`])
})

it(`.keep() throws without args`, () => {

    // @ts-expect-error type expects an arg too
    expect(() => match(1).keep()).toThrow(`Invalid signature, requires 1 parameters.`)
})

it(`handles infinite iterators`, () => {

    const matcher = match.each(primes(Infinity))
        .keep(i => i > 1000)
        .default(i => i)

    const [prime] = matcher

    expect(prime).toEqual(1009)
})

it(`match cannot be composed entirely of discard cases`, () => {
    // @ts-expect-error next() will be inaccessible without output
    expect(() => match(0).discard(is.boolean).next())
        .toThrow(`No output cases have been defined.`)
})

it(`a match composed only of fall cases throws`, () => {
    const m = match(1).fall(i => i * 10)
    // @ts-expect-error next() will be inaccessible without output
    expect(() => m.next())
        .toThrow(`No output cases have been defined.`)
})

it(`.next() to retreive the next output`, () => {

    enum Status {
        IDLE,
        SUCCESS,
        ERROR
    }

    const matchStatusToMessage = match(Status.IDLE, Status.SUCCESS, Status.ERROR)
        (Status.IDLE, `Download has not yet started`)
        (Status.SUCCESS, `Download succeeded`)
        (Status.ERROR, `Download failed`)

    expect(matchStatusToMessage.next())
        .toEqual(`Download has not yet started`)

    expect(matchStatusToMessage.next())
        .toEqual(`Download succeeded`)

    expect(matchStatusToMessage.next())
        .toEqual(`Download failed`)
})

it(`.remaining() to retreive all remaining outputs`, () => {

    const normalizeRanges = (...values: number[]): number[] =>
        match(...values)
            .fall(i => i < 0, i => -i)
            .break(i => i > 10, 10)
            .default()
            .rest()

    const values = normalizeRanges(-1, -11, 11, 5)

    expect(values).toEqual([1, 10, 10, 5])
})

it(`throws if more attempts to add cases are made once the cases are finalized`, () => {

    for (const finalMatchers of [
        match(0)(i => i),
        match(1)(1),
        match(2).default(i => i),
        match(3).default(3),
        match(4)(4, 4).finalize()
    ])
        // @ts-expect-error type is smart enough to know that the cases are complete
        expect(() => finalMatchers(`ace`)).toThrow(`No more cases may be defined`)

})

it(`thrown errors do not impede further matching`, () => {

    const m = match(1, 2, 0, 3)(
        0, () => {
            throw new Error(`Can't divide by zero`)
        })
        .default(i => i / 2)

    expect(() => [...m]).toThrow(`Can't divide by zero`)
    expect(m.next()).toEqual(1.5)

})

it(`cannot finalize a match without cases`, () => {
    // @ts-expect-error typescript knows that finalize() shouldn't be called without cases
    expect(() => match(0).finalize())
        .toThrow(`No output cases have been defined.`)
})

it(`cases are required`, () => {

    expect(() =>
        // @ts-expect-error typing is supposed to fail without cases
        [...match(0)]
    ).toThrow(`No output cases have been defined`)
})

it(`iterator must have at least one value`, () => {
    expect(() => match.each([])(1).next())
        .toThrow(`No values to match.`)
})

it(`can match template strings`, () => {

    const output = match.template`one:${1} two:${2} three:${true}`
        .fall(([, v]) => v)
        .default(v => v)
        .rest()

    expect([...output]).toEqual([1, 2, true])
})

describe(`handles explicit output types`, () => {

    interface Todo {
        completed?: boolean
        index?: number
        content: string | string[]
    }

    function isTodo(input: unknown): input is Todo {
        return isPartialTodo(input) &&
            (
                is.string(input.content) ||
                is.arrayOf.string(input.content)
            )
    }

    function isPartialTodo(input: unknown): input is Partial<Todo> {
        return is.object(input)
    }

    it(`match<Type>(...values)`, () => {

        const input: unknown[] = [undefined, undefined]

        const [{ index = 0, content = `` }] = match<Todo>(...input)
            (is.number, index => ({ index, content: `` }))
            (is.string, content => ({ content }))
            (is.arrayOf.string, content => ({ content }))
            .default({ content: `` })

        expect(index).toEqual(0)
        expect(content).toEqual(``)

    })

    it(`outputs must conform`, () => {

        // @ts-expect-error output is not of type TODO
        match<Todo>(true)(is.boolean, complete => ({ complete }))
    })

    it(`preserves functions broken due to no output cases`, () => {

        const matchTodos = match<Todo>(0)

        // @ts-expect-error should not be able to finalize
        expect(() => matchTodos.finalize())
            .toThrow(`No output cases have been defined.`)

        // @ts-expect-error should not be able to iterate
        expect(() => matchTodos.next())
            .toThrow(`No output cases have been defined.`)

    })

    it(`.break() single method must output target type`, () => {

        // @ts-expect-error output is not of type Todo
        match<Todo>().break(isPartialTodo)

        // should not break, is of type Todo
        match<Todo>().break(isTodo)
    })

    it(`.match<Type, Inputs>()`, () => {

        const isCompletedString = (input: unknown): input is { completed: string } => {
            return (
                is.object<{ completed: unknown }>(input) &&
                is.string(input.completed)
            )
        }

        const isArrayOfString = (input: unknown): input is (string[] | readonly string[]) =>
            is.arrayOf.string(input)

        const inputs = [
            true,
            false,
            `content`, [`content`],
            { completed: `town` },
            { completed: false }
        ] as const

        const [...todos] = match<typeof inputs, Todo>(...inputs)

            .fall(is.boolean, completed => ({ completed }))
            .fall(is.string, content => ({ content }))
            .fall(isArrayOfString, content => ({ content: [...content] }))

            .discard(isCompletedString)

            .default(remaining => ({
                completed: false,
                content: ``,

                // without the explicit value signature, this type would be undefined
                ...remaining
            }))

        expect(todos.every(isTodo))
            .toBe(true)
    })

})

describe(`.reusable() match instance`, () => {

    it(`allows match expressions to be reused with new values`, () => {

        const matchEven = match.for<number | string, number>(match => match
            .break(is.string, parseInt)
            .keep(i => i % 2 === 0)
            .default()
        )

        expect(matchEven(`4`)).toBe(4)
        expect(matchEven(2)).toBe(2)

        expect(() => matchEven(3)).toThrow(`Value was discarded.`)

    })

    it(`match must have cases`, () => {
        expect(() => match.for(m => m)).toThrow(`No output cases have been defined.`)
    })

})

