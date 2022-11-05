import { NoMatchError, NotMatchExpressionError } from './error'

import {

    Case,

    MatchExpression, 
    MatchExpressionState, 
    MatchExpressionBuilderEmpty,

    MatchState,
    MatchBuilder,
    MatchInput,

    MatchInputType

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
function * iterateValues(this: MatchExpression): Generator<unknown> {

    if (this.values.length === 0)
        throw new NotMatchExpressionError()

    for (const value of this.values)
        yield this.value(value)

}

//// Interface ////

/**
 * Create an iterable match with a single value
 * @param value 
 */
function match<I extends MatchInput>(value: I): MatchExpressionBuilderEmpty<I>

/**
 * Create an iterable match with a set of values
 * @param values
 */
function match<A extends readonly MatchInput[]>(...values: A): MatchExpressionBuilderEmpty<A[number]>

function match(this: MatchExpressionState, input: unknown, output: unknown): MatchBuilder

/**
 * Handle all create-match signatures
 */
function match(this: unknown, ...args: unknown[]): unknown {

    const nextState = {
        cases: [] as readonly Case[],
        values: args as readonly unknown[]
    }

    // Immutable case increment
    const prevState = this as MatchExpressionState | void
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
    
    // match() is an illegal call
    } else if (args.length === 0)
        throw new Error('match expression requires at least one value')

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
}) as <I extends MatchInput, O extends MatchInput>(
    input: I, 
    output: O
) => MatchBuilder<MatchInputType<I>, O>

//// Exports ////

export default match

export { match }