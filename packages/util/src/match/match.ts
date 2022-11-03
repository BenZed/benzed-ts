import { NoMatchError, NoIterableValuesError } from './error'
import { Case, Match, MatchState } from './types'

//// Match Methods ////

/**
 * Match a value against a set of cases.
 * Will throw if no value can be found
 */
function value(
    this: { cases: readonly Case[] },
    value: unknown, 
): unknown {
    for (const { input, output, default: isDefault } of this.cases) {
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

/**
 * Iterate through the previously defined values
 */
function * iterateValues(this: Match): Generator<unknown> {

    if (this.values.length === 0)
        throw new NoIterableValuesError()

    for (const value of this.values)
        yield this.value(value)

}

//// Interface ////

/**
 * Create a matcher for a single value
 * @param value 
 */
function match(value: unknown): Match
/**
 * Create a matcher for a set of values
 * @param values
 */
function match(...values: unknown[]): Match
/**
 * Add a default case
 * @param output Value to use if match cannot be found in previously defined cases
 */
function match(this: MatchState, output: unknown): Match
/**
 * Add a match case
 * @param input Input to match against
 * @param output Output to match to
 */
function match(this: MatchState, input: unknown, output: unknown): Match

/**
 * Handle all create-match signatures
 */
function match(this: unknown, ...args: unknown[]): unknown {

    const nextState = {
        cases: [] as readonly Case[],
        values:  args as readonly unknown[]
    }

    // immutable add
    const prevState = this as MatchState | void
    if (prevState) {
        // .case() signature
        const newCase = args.length === 2 
            ? { 
                input: args[0], 
                output: args[1], 
                default: false 
            }
            // .default() signature
            : { 
                input: undefined, 
                output: args[0], 
                default: true 
            }
        
        nextState.cases = newCase ? [ ...prevState.cases ] : prevState.cases
        nextState.values = prevState.values
    }

    const instance = {
        ...nextState,
        value,
        case: match,
        default: match,
        [Symbol.iterator]: iterateValues
    }

    return Object.assign(
        value.bind(instance), 
        instance
    )

}

/**
 * Create a match for a non-defined set of values
 */
match.case = match as (input: unknown, output: unknown) => Match

//// Exports ////

export default match

export { match }