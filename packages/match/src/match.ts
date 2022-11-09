import { equals } from '@benzed/immutable'
import is from '@benzed/is'

import { 

    UnmatchedValueError, 
    NoMultipleDefaultCasesError,
    NotMatchExpressionError

} from './error'

import {

    MatchExpression, 
    MatchExpressionBuilderEmpty,

    MatchState,
    MatchBuilder,
    MatchInput,

    Case,
    CaseInput,
    CaseOutput,

    Match,
    MatchOutput,
    MatchOutputType,
    MatchInputType,
    MatchBuilderEmpty,
    Matchable,
    MatchExpressionState,

} from './types'

//// Helper ////

function toInput(value: unknown): CaseInput{
    return is.function<CaseInput>(value) 
        ? value 
        : (i: unknown) => equals(i, value)
}

function toOutput(value: unknown): CaseOutput{
    return is.function<CaseOutput>(value) 
        ? value 
        : () => value
}

function isMatch(input: unknown): input is Match<unknown,unknown> {
    return is.function<Match<unknown,unknown>>(input)
        && is.array(input.cases) 
        && input.cases.length > 0
}

//// Match Methods ////

/**
 * Match a value against a set of cases.
 * Will throw if no value can be found.
 */
function value(
    this: MatchState,
    value: unknown, 
): unknown {
    for (const _case of this.cases) {

        const { input, output } = _case

        const isDefault = input === undefined
        if (!isDefault && !input(value))
            continue 
            
        let result = output(value)

        // optimization for nested match
        if (isMatch(result)) {

            // prevent the match expression from being rebuilt
            (_case as { output: unknown }).output = result

            result = result(value)
        }

        return result
    }

    throw new UnmatchedValueError(value)
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
 * Create an empty optionally typed (bounded) match expression
 */
function match<T>(): MatchBuilderEmpty<T>

/**
 * Create an iterable match with a single value
 * @param value 
 */
function match<I extends Matchable>(value: I): MatchExpressionBuilderEmpty<MatchInputType<I>>

/**
 * Create an iterable match with a set of values
 * @param values
 */
function match<A extends readonly Matchable[]>(...values: A): MatchExpressionBuilderEmpty<MatchInputType<A[number]>>

/**
 * Add an addional case to an existing match
 */
function match(this: MatchState, input: unknown, output: unknown): MatchBuilder<unknown>

/**
 * Add a default case to an existing match
 */
function match(this: MatchState, output: unknown): Match

/**
 * Handle all create-match signatures
 */
function match(this: unknown, ...args: unknown[]): unknown {

    const prevState = this as MatchExpressionState | void

    const nextState = {
        cases: [] as readonly Case[],
        values: args as readonly unknown[]
    }

    // TODO handle bounded expressions

    // Immutable case increment
    if (prevState) {

        // .case() signature
        const newCase = args.length === 2 
            ? { 
                input: toInput(args[0]), 
                output: toOutput(args[1]) 
            }
            // .default() signature
            : { 
                output: toOutput(args[0])
            }

        const isDefaultCase = !newCase.input
        const hasDefaultCase = prevState.cases.some(c => !c.input)
        if (isDefaultCase && hasDefaultCase)
            throw new NoMultipleDefaultCasesError()
        
        nextState.cases = newCase ? [ ...prevState.cases, newCase ] : prevState.cases
        nextState.values = prevState.values
    } 

    return Object.assign(
        value.bind(nextState), 
        {
            ...nextState,
            value,
            case: match,
            default: match,
            [Symbol.iterator]: iterateValues
        }
    )
}

/**
 * Create a match
 */
match.case = match.bind({ 
    cases: [], 
    values: [] 
}) as <I extends MatchInput<unknown>, O extends MatchOutput<I>>(
    input: I, 
    output: O
) => MatchBuilder<unknown, MatchInputType<I>, MatchOutputType<O>>

//// Exports ////

export default match

export { match }