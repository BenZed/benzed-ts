
//// Matchable ////

export type Matchable = string | number | boolean | bigint | object
type _FromMatchable<I> = I extends string 
    ? string 
    : I extends number 
        ? number 
        : I extends boolean 
            ? boolean 
            : I extends bigint 
                ? bigint 
                : object

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

export interface Matcher<I = unknown, O = unknown> extends Match<I, O> {

    case<Ix extends Matchable, Ox extends Matchable>(
        input: Ix, 
        output: Ox
    ): Matcher<I | Ix, O | Ox>

    default<Ox extends Matchable>(output: Ox): Match<_FromMatchable<I>, O | Ox>

}

//// Iterable Match ////

export interface MatchIterableState<V = unknown> extends MatchState {
    values: readonly V[]
}

export interface MatcherIterableEmpty<I = unknown> extends MatchIterableState<I> {

    case<Ox>(input: I, output: Ox): MatcherIterable<I, Ox>

}

export interface MatcherIterable<I = unknown, O = unknown> extends MatcherIterableEmpty<I> {

    default<Ox>(output: Ox): MatchIterable<I, O | Ox>

}

export interface MatchIterable<I = unknown, O = unknown> extends Match<I, O>, MatchIterableState<I> {

    [Symbol.iterator](): Generator<O>

}

