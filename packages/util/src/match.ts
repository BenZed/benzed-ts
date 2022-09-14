
/* 
    eslint-disable 
    
    @typescript-eslint/indent, 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/explicit-function-return-type
    
*/

/*** Types ***/

type Guard<T> = (input: T) => input is T
type Predicate<T> = (input: T) => boolean

type Input<T> = T | Guard<T> | Predicate<T>

type Output<V, I, O> =
    O |
    (
        I extends Guard<infer I2>
        ? (input: I2) => O
        : (input: V) => O
    )

type Ensure<ON, O extends readonly unknown[]> = O extends [infer O1, ...infer OR]
    ? ON extends O1 ? O : [O1, ...Ensure<ON, OR>]
    : [ON]

interface Match<V, O extends readonly unknown[]> {

    <O1, I extends Input<V>>(...io:
        [I, Output<V, I, O1>] |
        [O1 | ((input: V) => O1)]
    ): Match<V, Ensure<O1, O>>

    [Symbol.iterator]: (O extends [] ? never : () => Iterator<O[number]>)

}

/*** Helpers ***/

function tryCall(f: unknown, fArg: unknown, fNot: unknown = f): unknown {

    return typeof f === 'function'
        ? f(fArg)
        : fNot
}

function anyPass(): true {
    return true
}

/*** Main ***/

function match<A extends readonly any[]>(...values: A) {

    type V = A[number]

    // State
    const cases: { input: unknown, output: unknown }[] = []

    // Main
    const match = (...args: [unknown, unknown] | [unknown]) => {

        let [input, output] = args

        // sorting input-output signature
        if (args.length === 1) {
            output = input
            input = anyPass
        }

        cases.push({ input, output })
        return match
    }

    let error: unknown
    const outputs: unknown[] = [];
    // Retreive Values
    (match as any)[Symbol.iterator] = function* () {

        if (cases.length === 0)
            throw new Error('No cases have been defined')

        // results already cache
        const isOutputCached = error || outputs.length > 0
        if (!isOutputCached) {
            try {
                for (const value of values) {
                    let atLeastOneMatch = false

                    for (const { input, output } of cases) {

                        const isMatch = tryCall(input, value, input === value)
                        if (!isMatch)
                            continue

                        atLeastOneMatch = true

                        outputs.push(tryCall(output, value))
                        break
                    }

                    if (!atLeastOneMatch)
                        throw new Error(`No match for ${value}`)
                }
            } catch (e) {
                error = e
            }
        }

        for (const output of outputs)
            yield output

        if (error)
            throw error
    }

    return match as Match<V, []>

}

/*** Extensions ***/

match.any = anyPass

match.default = match.any

match.n = <I>(times: number, input: I): I =>

    ((value: unknown): boolean => {

        const isMatch = tryCall(input, value, input === value)
        if (!isMatch || times <= 0)
            return false

        times--

        return true
    }) as unknown as I

match.once = <I>(input: I) => match.n(1, input)

/*** Exports ***/

export default match

export {
    match,
    Match
}
