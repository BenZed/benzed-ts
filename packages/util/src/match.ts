
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

    <O1, I extends Input<V>>(...args: [I, Output<V, I, O1>]): Match<V, Ensure<O1, O>>

    [Symbol.iterator]: (O extends [] ? never : () => Iterator<O[number]>)

}

/*** Helpers ***/

function tryCall(f: unknown, fArg: unknown, fNot: unknown = f): unknown {

    return typeof f === 'function'
        ? f(fArg)
        : fNot
}

/*** Main ***/

function match<A extends readonly any[]>(...values: A) {

    type V = A[number]

    // State
    const cases: { input: unknown, output: unknown }[] = []

    // Main
    const match = (input: unknown, output: unknown) => {
        cases.push({ input, output })
        return match
    }

    // Retreive Values
    (match as any)[Symbol.iterator] = function* () {

        if (cases.length === 0)
            throw new Error('No cases have been defined')

        for (const value of values) {

            let atLeastOneMatch = false

            for (const { input, output } of cases) {

                const isMatch = tryCall(input, value, input === value)
                if (!isMatch)
                    continue

                atLeastOneMatch = true

                yield tryCall(output, value)
            }

            if (!atLeastOneMatch)
                throw new Error(`No match for ${value}`)
        }
    }

    return match as Match<V, []>

}

/*** Extensions ***/

match.any = () => true

match.n = <I>(times: number, input: I): I =>

    ((value: unknown) => {

        const isMatch = tryCall(input, value, input === value)
        if (isMatch)
            times--

        return isMatch ? times >= 0 : false

    }) as unknown as I

match.once = <I>(input: I): I => match.n(1, input)

/*** Exports ***/

export default match

export {
    match,
    Match
}
