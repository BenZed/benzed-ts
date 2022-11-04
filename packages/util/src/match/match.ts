import { NoMatchError, NoIterableValuesError } from './error'
import { 
    Case, 
    MatchIterable, 
    MatchState,
    MatchIterableState, 
    MatcherIterableEmpty,
    Matchable,
    Matcher
} from './types'

//// Match Methods ////

/**
 * Match a value against a set of cases.
 * Will throw if no value can be found.
 */
function value(
    this: MatchState,
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
 * Create a non-iterable match
 */
function match(): Matcher<never, never>

/**
 * Create an iterable match with a single value
 * @param value 
 */
function match<I extends Matchable>(value: I): MatcherIterableEmpty<I>
/**
 * Create an iterable match with a set of values
 * @param values
 */
function match<A extends readonly Matchable[]>(...values: A): MatcherIterableEmpty<A[number]>

function match(this: MatchIterableState, input: unknown, output: unknown): Matcher

/**
 * Handle all create-match signatures
 */
function match(this: unknown, ...args: unknown[]): unknown {

    const nextState = {
        cases: [] as readonly Case[],
        values: args as readonly unknown[]
    }

    // immutable add
    const prevState = this as MatchIterableState | void
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
 * Create a non-iterable match
 */
match.case = match.bind({ 
    cases: [], 
    values: [] 
}) as <I extends Matchable, O extends Matchable>(
    input: I, 
    outut: O
) => Matcher<I,O>

//// Exports ////

export default match

export { match }