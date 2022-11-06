/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Matchable ////

type Primitives = string | number | boolean | bigint | symbol
type Object = { [key: string | number | symbol]: unknown }

type MatchPredicate<I, O> = ((input: I) => O)
type MatchGuard<T> = ((input: unknown) => input is T)

export type MatchInput = 
    | MatchGuard<unknown>
    | MatchPredicate<unknown, any>
    | Primitives 
    | Object

export type MatchOutput<I> = 

    | MatchPredicate<MatchInputType<I>, unknown>
    | Primitives 
    | Object 

type MatchDefaultOutput = 

    | MatchPredicate<unknown, any>
    | Primitives 
    | Object 

type _BroadMatchInput<I> = I extends string 
    ? string 
    : I extends number 
        ? number 
        : I extends boolean 
            ? boolean 
            : I extends bigint 
                ? bigint 
                : I extends Object 
                    ? { -readonly [K in keyof I]: _BroadMatchInput<I[K]> } 
                    : I

export type MatchInputType<I> = 
    I extends Primitives 
        ? I 
        : I extends MatchGuard<infer Ix>
            ? Ix 
            : I extends Object 
                ? I
                : I extends (i: unknown) => any 
                    ? unknown
                    : never 

export type MatchOutputType<O> = 
    O extends Primitives 
        ? O 
        : O extends MatchPredicate<any, infer Ox>
            ? Ox extends Match<any, infer Oxx> | MatchExpression<any, infer Oxx> | MatcherExpressionBuilder<any, infer Oxx>
                ? Oxx
                : Ox
            : O

//// Match State ////

export type CaseInput = MatchPredicate<unknown, boolean>
export type CaseOutput = MatchPredicate<unknown, unknown>

export interface Case {
    readonly input?: CaseInput
    readonly output: CaseOutput
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

    case<Ix extends MatchInput, Ox extends MatchOutput<Ix>>(
        input: Ix, 
        output: Ox
    ): MatchBuilder<I | MatchInputType<Ix>, O | MatchOutputType<Ox>>

    default<Ox extends MatchDefaultOutput>(output: Ox): Match<_BroadMatchInput<I>, O | MatchOutputType<Ox>>

}

//// Match Expression ////

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

