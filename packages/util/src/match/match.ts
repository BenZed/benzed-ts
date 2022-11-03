import { NoMatchError, NoIterableValuesError } from './error'
import { 
    Case, 
    MatchBuilder, 
    MatchIterable, 
    MatchCases,
    MatchState, 
    MatchIterableEmptyBuilder
} from './types'

//// Match Methods ////

/**
 * Match a value against a set of cases.
 * Will throw if no value can be found.
 */
function value(
    this: MatchCases,
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
 * Iterate through the previously defined values.
 */
function * iterateValues(this: MatchIterable): Generator<unknown> {

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
function match(value: unknown): MatchIterableEmptyBuilder
/**
 * Create a matcher for a set of values
 * @param values
 */
function match(...values: unknown[]): MatchIterableEmptyBuilder

function match(this: MatchState, input: unknown, output: unknown): MatchBuilder

/**
 * Handle all create-match signatures
 */
function match(this: unknown, ...args: unknown[]): unknown {

    const nextState = {
        cases: [] as readonly Case[],
        values: args as readonly unknown[]
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
        
        nextState.cases = newCase ? [ ...prevState.cases, newCase ] : prevState.cases
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
match.case = match.bind({ 
    cases: [], 
    values: [] 
}) as (input: unknown, output: unknown) => MatchBuilder

//// Exports ////

export default match

export { match }