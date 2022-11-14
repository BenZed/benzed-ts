
import { Primitive } from '@benzed/util'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Helper Types ////

type _UnusedExpressionInput<T, I> = I extends MatchGuard<infer O> 
    ? Exclude<T, O> 
    : Exclude<T, I>

type _UnusedInput<T, I> = unknown extends T 
    ? never 
    : Exclude<T, MatchInputType<I>>

type _BroadMatchInput<I> = I extends string 
    ? string 
    : I extends number 
        ? number 
        : I extends boolean 
            ? boolean 
            : I extends bigint 
                ? bigint 
                : I 
                    
//// Matchable ////

export type MatchPredicate<I, O> = ((input: I) => O)

export type MatchGuard<T> = ((input: unknown) => input is T)

//// Match ////

export type Matchable = Primitive | object

export type MatchInput<T> = unknown extends T 
    ? 
    | MatchPredicate<unknown, unknown>  
    | Primitive
    | object
    
    : MatchPredicate<T, unknown> 
    | T

export type MatchExpressionInput<T> =
    | Primitive
    | object
    | MatchPredicate<T, unknown>
    
export type MatchOutput<I> = 
    | object 
    | Primitive 
    | MatchPredicate<MatchInputType<I>, unknown>

type MatchDefaultOutput = 
    | object 
    | Primitive 
    | MatchPredicate<unknown, any>

export type MatchInputType<I> = 
    I extends Primitive 
        ? I 
        : I extends MatchGuard<infer Ix>
            ? Ix 
            : I extends MatchPredicate<infer Ix, any>
                ? Ix
                : I 

export type MatchOutputType<O> = 
    O extends Primitive 
        ? O 
        : O extends MatchPredicate<any, infer Ox>
            ? Ox extends MatchExpression<any, infer Oxx> | MatchExpressionIncomplete<any, any, infer Oxx> 
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

/**
 * Match without any cases defined
 */
export interface MatchEmpty<T> {

    case<Ix extends MatchInput<T>, O extends MatchOutput<Ix>>(
        input: Ix, 
        output: O
    ): _UnusedInput<T, Ix> extends never
        ? Matcher<T, MatchInputType<Ix>, MatchOutputType<O>>
        : MatchIncomplete<T, MatchInputType<Ix>, MatchOutputType<O>>

}

/**
 * Match with some cases defined, but not all of the inputs have been handled
 */
export interface MatchIncomplete<T, I = unknown, O = unknown> {

    case<Ix extends MatchInput<T>, Ox extends MatchOutput<Ix>>(
        input: Ix, 
        output: Ox
    ): _UnusedInput<T, I | Ix> extends never
        ? Matcher<T, I | MatchInputType<Ix>, O | MatchOutputType<Ox>>
        : MatchIncomplete<T, I | MatchInputType<Ix>, O | MatchOutputType<Ox>>

    default<Ox extends MatchDefaultOutput>(output: Ox): Match<_BroadMatchInput<I>, O | MatchOutputType<Ox>>

}

/**
 * Match with all input cases handled, but more cases may be defined
 */
export interface Matcher<T, I = unknown, O = unknown> extends Match<I, O> {

    case<Ix extends MatchInput<T>, Ox extends MatchOutput<Ix>>(
        input: Ix, 
        output: Ox
    ): Matcher<T, I | MatchInputType<Ix>, O | MatchOutputType<Ox>>

    default<Ox extends MatchDefaultOutput>(output: Ox): Match<_BroadMatchInput<I>, O | MatchOutputType<Ox>>

}

//// Match Expression ////

export interface MatchExpressionState<V = unknown> extends MatchState {
    values: readonly V[]
}

export interface MatchExpressionEmpty<U = unknown> extends MatchExpressionState<U> {

    case<Ux extends MatchExpressionInput<U>, O extends MatchOutput<Ux>>(input: Ux, output: O): _UnusedExpressionInput<U, Ux> extends never 
        ? MatchExpression<MatchInputType<Ux>, MatchOutputType<O>>
        : MatchExpressionIncomplete<_UnusedExpressionInput<U, Ux>, MatchInputType<Ux>, MatchOutputType<O>>

}

export interface MatchExpressionIncomplete<U, I = unknown, O = unknown> extends MatchExpressionState<I> {

    case<Ux extends MatchExpressionInput<I>, Ox extends MatchOutput<Ux>>(input: Ux, output: Ox): _UnusedExpressionInput<U, Ux> extends never 
        ? MatchExpression<I | MatchInputType<Ux>, O | MatchOutputType<Ox>>
        : MatchExpressionIncomplete<_UnusedExpressionInput<U, Ux>, I | MatchInputType<Ux>, O | MatchOutputType<Ox>>

    default<Ox extends MatchOutput<I>>(output: Ox): MatchExpression<_BroadMatchInput<I>, O | MatchOutputType<Ox>>

}

export interface MatchExpression<I = unknown, O = unknown> extends Match<I, O>, MatchExpressionState<I> {

    [Symbol.iterator](): Generator<O>

}

