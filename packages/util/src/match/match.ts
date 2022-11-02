
import { NoMatchError, NoIterableValuesError } from './error'
import { Match, MatchState } from './types'

//// This might be the most brilliant 100 lines of typescript I'll ever write ////

//// Helper ////

function mapMatchedValues(state: MatchState): unknown[] {

    const results = []

    match: for (const value of state.values) {
        for (const { input, output, default: isDefault } of state.cases) {
            if (
                isDefault ||
                (typeof input === 'function' 
                    ? input(value) 
                    : input === value)
            ) {
                results.push(
                    typeof output === 'function'
                        ? output(value)
                        : output
                )
                continue match
            }
        }

        throw new NoMatchError(value)
    }

    return results
}

function * iterateMatchedValues(this: Match): Generator<unknown> {

    if (this.values.length === 0)
        throw new NoIterableValuesError()

    for (const value of this.values)
        yield this(value)

}

function addCase(this: void | MatchState, input: unknown, output: unknown = input): Match {

    return match.call({
        values: this ? this.values : [],
        cases: [ ...this ? this.cases : [], { input, output, default: false } ]
    })

}

function addDefaultCase(this: void | MatchState, output: unknown): Match {

    return match.call({
        values: this ? this.values : [],
        cases: [ ...this ? this.cases : [], { input: output, output, default: true } ]
    })

}

//// Main ////

function match(this: void, ...values: unknown[]): Match 
function match(this: MatchState): Match
function match(this: void | MatchState, ...values: unknown[]): unknown {

    if (this && values.length > 0) {
        const results = mapMatchedValues({ cases: this.cases, values })
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

//// Extend ////

match.case = addCase

//// Exports ////

export default match

export {
    match
}