
import { NoMatchError, NoIterableValuesError } from './error'
import { Case, Match, MatchState } from './types'

//// This might be the most brilliant 100 lines of typescript I'll ever write ////

//// Match Methods ////

function matchValue(value: unknown, cases: readonly Case[]): unknown {
    for (const { input, output, default: isDefault } of cases) {
        if (
            isDefault || ( typeof input === 'function' 
                ? input(value) 
                : input === value
            )
        ) {
            return typeof output === 'function'
                ? output(value)
                : output
        }
    }
    throw new NoMatchError(value)
}

function matchValues(values: unknown[], cases: readonly Case[]): unknown[] {

    const results: unknown[] = []

    for (const value of values) 
        results.push(matchValue(value, cases))        

    if (results.length === 0)
        throw new NoIterableValuesError()

    return results
}

//// State Methods ////

function * iterateMatchedValues(this: MatchState): Generator<unknown> {

    if (this.values.length === 0)
        throw new NoIterableValuesError()

    for (const value of this.values)
        yield matchValue(value, this.cases)

}

function addCase(this: MatchState, input: unknown, output = input): Match {

    return match.call({
        values: this.values,
        cases: [ ...this.cases, { input, output, default: false } ]
    })

}

function addDefaultCase(this: MatchState, output: unknown): Match {

    return match.call({
        values: this.values,
        cases: [ ...this.cases, { input: undefined, output, default: true } ]
    })

}

//// Interface ////

function match(this: void, ...values: unknown[]): Match 
function match(this: MatchState): Match
function match(this: void | MatchState, ...values: unknown[]): unknown {

    if (this && values.length > 0) {
        const results = matchValues(values, this.cases)
        return values.length === 1 ? results[0] : results
    }

    const state = {
        values: values.length > 0 ? values : this ? this.values : [],
        cases: this ? this.cases : [],
        case: addCase,
        default: addDefaultCase,
        [Symbol.iterator]: iterateMatchedValues
    }

    return Object.assign(
        match.bind(state), 
        state
    )

}

match.case = addCase.bind({ values: [], cases: [] })

//// Exports ////

export default match

export { match }