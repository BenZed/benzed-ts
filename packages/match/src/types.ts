/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Helper Types ////
    
type _UnusedInput<I, Ix> = Ix extends MatchGuard<infer Ixx> 
    ? Exclude<I, Ixx>
    : Exclude<I, Ix>

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
                    
//// Matchable ////

type Primitives = string | number | boolean | bigint | symbol
type Object = { [key: string | number | symbol]: unknown }

type MatchPredicate<I, O> = ((input: I) => O)
type MatchGuard<T> = ((input: unknown) => input is T)

//// Match ////

export type MatchInput = 
    | MatchGuard<unknown>
    | MatchPredicate<unknown, unknown>
    | Primitives 
    | Object

export type MatchExpressionInput<T> =
    | Primitives
    | Object
    | MatchPredicate<T, unknown>
    
export type MatchOutput<I> = 
    | Object 
    | Primitives 
    | MatchPredicate<MatchInputType<I>, unknown>

type MatchDefaultOutput = 
    | Object 
    | Primitives 
    | MatchPredicate<unknown, any>

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
            ? Ox extends Match<any, infer Oxx> | MatchExpression<any, infer Oxx> 
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

    case<Ix extends MatchExpressionInput<I>, O extends MatchOutput<Ix>>(input: Ix, output: O): _UnusedInput<I, Ix> extends never 
        ? MatchExpression<I, MatchOutputType<O>>
        : MatchExpressionBuilder<_UnusedInput<I, Ix>, I, MatchOutputType<O>>

}

export interface MatchExpressionBuilder<U extends I, I = unknown, O = unknown> extends MatchExpressionState<I> {

    case<Ux extends MatchExpressionInput<I>, Ox extends MatchOutput<Ux>>(input: Ux, output: Ox): _UnusedInput<U, Ux> extends never 
        ? MatchExpression<I, O | MatchOutputType<Ox>>
        : MatchExpressionBuilder<_UnusedInput<U, Ux>, I, O | MatchOutputType<Ox>>

    default<Ox extends MatchOutput<I>>(output: Ox): MatchExpression<_BroadMatchInput<I>, O | MatchOutputType<Ox>>

}

export interface MatchExpression<I = unknown, O = unknown> extends Match<I, O>, MatchExpressionState<I> {

    [Symbol.iterator](): Generator<O>

}

