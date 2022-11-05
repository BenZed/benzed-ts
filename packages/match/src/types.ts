/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Matchable ////

type Primitives = string | number | boolean | bigint | symbol

// type MatchPredicate<T> = ((input: T) => boolean)
type MatchGuard<T> = ((input: unknown) => input is T)

export type MatchInput = 
    | Primitives 
    | MatchGuard<unknown>

type _GeneralizeMatchInput<I> = I extends string 
    ? string 
    : I extends number 
        ? number 
        : I extends boolean 
            ? boolean 
            : I extends bigint 
                ? bigint 
                : never

export type MatchInputType<I> = 
    I extends Primitives 
        ? I 
        : I extends MatchGuard<infer Ix>
            ? Ix 
            : never

//// Match State ////

export interface Case {
    readonly input: unknown | ((input: unknown) => boolean)
    readonly output: unknown | ((input: unknown) => unknown)
    readonly default: boolean
}

export interface MatchState {
    cases: readonly Case[]
}

//// Match ////

export interface Match<I = unknown, O = unknown> extends MatchState {

    (value: I): O

    value(value: I): O

}

export interface MatchBuilder<I = unknown, O = unknown> extends Match<I, O> {

    case<Ix extends MatchInput, Ox extends MatchInput>(
        input: Ix, 
        output: Ox
    ): MatchBuilder<I | MatchInputType<Ix>, O | Ox>

    default<Ox extends MatchInput>(output: Ox): Match<_GeneralizeMatchInput<I>, O | Ox>

}

//// Iterable Match ////

export interface MatchExpressionState<V = unknown> extends MatchState {
    values: readonly V[]
}

export interface MatchExpressionBuilderEmpty<I = unknown> extends MatchExpressionState<I> {

    case<Ox>(input: I, output: Ox): MatcherExpressionBuilder<I, Ox>

}

export interface MatcherExpressionBuilder<I = unknown, O = unknown> extends MatchExpressionBuilderEmpty<I> {

    default<Ox>(output: Ox): MatchExpression<I, O | Ox>

}

export interface MatchExpression<I = unknown, O = unknown> extends Match<I, O>, MatchExpressionState<I> {

    [Symbol.iterator](): Generator<O>

}

