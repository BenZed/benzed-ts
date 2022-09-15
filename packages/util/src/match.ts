import { Merge } from './types'

/* 
    eslint-disable 
    @typescript-eslint/indent, 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/explicit-function-return-type
*/

/*** Helper Types ***/

type Guard<I, O extends I> = (input: I) => input is O
type Predicate<T> = (input: T) => boolean

type OutputMethod<V, I, O> = I extends Guard<any, infer I2>
    ? (input: I2) => O
    : (input: V) => O

/**
 * Add type to output if it doesn't exist already
 */
type Ensure<ON, O extends readonly unknown[]> = O extends [infer O1, ...infer OR]
    ? ON extends O1 ? O : [O1, ...Ensure<ON, OR>]
    : [ON]

/*** Output Types ***/

type DiscardValue<V, I> =
    I extends Guard<any, infer T>
    ? Exclude<V, T>
    : V

type KeepValue<V, I> =
    I extends Guard<any, infer T>
    ? Extract<V, T>
    : V

/**
 * Fall should be smart enough to use type guards to eliminate
 * types from the remaining cases and add the Output as 
 * a new case
 */
type FallValue<V, I, O> =
    // Merge<...>['value'] to make the output type nicer
    Merge<[{
        value: DiscardValue<V, I> | O
    }]>['value']

type Output<V, I, O> =
    OutputMethod<V, I, O> | O

/*** Input Types ***/

type Input<T> = Predicate<T> | Guard<T, T> | T

/*** Match ***/

interface MatchFinalized<O extends readonly unknown[]> {

    /**
     * Return values provided output cases are not empty
     */
    [Symbol.iterator]: (O extends [] ? never : () => Iterator<O[number]>)

    /**
     * Returns the next output
     */
    next(): O[number]

    /**
     * Returns the remaining outputs as an array
     */
    remaining(): O[number][]

}

interface Match<V, O extends readonly unknown[]> extends MatchFinalized<O> {

    /**
     * Create new case that breaks on match.
     */
    <O1, I extends Input<V>>(
        input: I,
        output: Output<V, I, O1>
    ): Match<V, Ensure<O1, O>>

    <O1, I extends Input<V>>(
        defaultOutput: Output<V, I, O1>
    ): MatchFinalized<Ensure<O1, O>>

    /**
     * Create new case that breaks on match.
     */
    break<O1, I extends Input<V>>(
        input: I,
        output: Output<V, I, O1>
    ): Match<V, Ensure<O1, O>>

    /**
     * Create a new case that passes the output to input on match
     */
    fall<O1, I extends Input<V>>(
        input: I,
        output: Output<V, I, O1>
    ): Match<FallValue<V, I, O1>, O>
    fall<O1, I extends Input<V>>(
        pass: OutputMethod<V, I, O1>
    ): Match<O1, O>

    /**
     * Do not create outputs for the match
     * @param input 
     */
    discard<I extends Input<V>>(
        input: I
    ): Match<DiscardValue<V, I>, O>

    /**
     * Only create outputs for this match
     * @param input 
     */
    keep<I extends Input<V>>(
        input: I
    ): Match<KeepValue<V, I>, O>

    /**
     * Create a final case that handles any remaining cases
     */
    default<O1, I extends Input<V>>(
        output: Output<V, I, O1>
    ): MatchFinalized<Ensure<O1, O>>

    /**
     * Prevent any further cases from being added
     */
    finalize: (O extends [] ? never : () => MatchFinalized<O>)

}

/*** Helpers ***/

function resolveOutput(output: unknown, input: unknown, _default: unknown = output): unknown {

    return typeof output === 'function'
        ? output(input)
        : _default
}

function matchAnyInput(): true {
    return true
}

function matchCheck(input: unknown, value: unknown): boolean {
    return !!resolveOutput(input, value, input === value)
}

function assertOutputCases(
    cases: { input: unknown, output: unknown, $$ymbol: symbol | null }[]
) {
    // $$symbols prevent output
    if (cases.filter(c => !c.$$ymbol).length === 0)
        throw new Error('No output cases have been defined.')
}

/*** Constants ***/

const $$iterable = Symbol('this-value-is-an-iterable')
const $$fall = Symbol('pipe-output-to-remaining-cases')
const $$discard = Symbol('disallow-output-from-this-input')

/*** Main ***/

/**
 * Match each of the provided values
 */
function match<A extends readonly any[]>(...values: A) {

    // State
    const cases: { input: unknown, output: unknown, $$ymbol: symbol | null }[] = []
    let finalized = false

    const iterable: Iterable<unknown> = values[1] === $$iterable
        ? values[0]
        : values
    let iterator: Iterator<unknown> | null = null
    let valueYieldedAtLeastOnce = false

    // Main
    const match = (...args: unknown[]) => {

        // check for final cases
        if (finalized)
            throw new Error('No more cases may be defined.')

        const $$ymbol = typeof args.at(-1) === 'symbol'
            ? args.pop() as symbol
            : null

        // sort arguments
        let [input, output] = args
        const isPipeArg = args.length === 1 && $$ymbol !== $$discard
        if (isPipeArg) {
            output = input
            input = matchAnyInput
        }

        // handle cases
        cases.push({ input, output, $$ymbol })
        finalized = isPipeArg && !$$ymbol

        // return interface
        return match
    }

    match.default = (input: unknown) => {
        return match(input)
    }

    match.break = (input: unknown, output: unknown) => {
        return match(input, output)
    }

    match.fall = (...args: [unknown, unknown] | [unknown]) => {
        return match(...args, $$fall)
    }

    match.discard = (input: unknown) => {
        return match(input, $$discard)
    }

    match.keep = (input: unknown) => {
        const invertDiscard = (value: unknown) =>
            !matchCheck(input, value)

        return match.discard(invertDiscard)
    }

    match.finalize = () => {

        assertOutputCases(cases)

        finalized = true
        return match
    }

    match.next = () => {
        const [output] = (match as any)[Symbol.iterator]()
        return output
    }

    match.remaining = () => {
        const output = (match as any)[Symbol.iterator]()
        return [...output]
    }

    // Retreive Values
    (match as any)[Symbol.iterator] = function* () {

        assertOutputCases(cases)

        // get iterator
        if (!iterator)
            iterator = iterable[Symbol.iterator]()

        let result = iterator.next()
        if (result.done) {
            throw new Error(
                valueYieldedAtLeastOnce
                    ? 'All values matched.'
                    : 'No values to match.'
            )
        }

        // get values
        while (!result.done) {

            let { value } = result
            let valueYielded = false
            let valueDiscarded = false

            // check value against all cases
            for (const { input, output, $$ymbol } of cases) {

                const discard = $$ymbol === $$discard
                const fall = $$ymbol === $$fall

                const isMatch = matchCheck(input, value)
                if (isMatch && !discard)
                    value = resolveOutput(output, value)

                if (isMatch && discard)
                    valueDiscarded = true

                // send output
                if (isMatch && !discard && !fall) {
                    valueYielded = true
                    valueYieldedAtLeastOnce = true
                    yield value
                }

                if (isMatch && !fall)
                    break
            }

            // ensure no value was must
            if (!valueYielded && !valueDiscarded)
                throw new Error(`No match for value: ${value}.`)

            result = iterator.next()
        }

        if (!valueYieldedAtLeastOnce)
            throw new Error('All values discarded.')

    }

    return match as unknown as Match<A[number], []>
}

/*** Extensions ***/

/**
 * Match the provided input an arbitrary number of times
 */
match.n = <I = typeof matchAnyInput>(times: number, input?: I): I =>

    ((value: unknown): boolean => {

        const isMatch = matchCheck(input ?? matchAnyInput, value)
        if (!isMatch || times <= 0)
            return false

        times--

        return true
    }) as unknown as I

/**
 * Match the provided input only once
 */
match.once = <I = typeof matchAnyInput>(input?: I): I =>
    match.n(1, input ?? matchAnyInput) as I

/**
 * Match each item in a provided iterator
 */
match.each = <I>(iterable: Iterable<I>): Match<I, []> =>
    match(iterable, $$iterable)

/**
 * Match each of the provided values
 */
match.values = <A extends readonly unknown[]>(...args: A) =>
    match(...args)

/**
 * 
 */
match.template = <A extends readonly unknown[]>(
    strings: TemplateStringsArray,
    ...values: A
) => {

    type Zipped<T extends readonly unknown[]> =
        T extends [infer TI, ...infer TR]
        ? TR extends []
        ? [[string, TI]]
        : [[string, TI], ...Zipped<TR>]
        : [string, T[number]][]

    const zipped = strings
        .map((str, i) => [str, values[i]]) as Zipped<A>

    return match(...zipped)
}

/*** Exports ***/

export default match

export {
    match,
    Match,
    MatchFinalized
}
