
//// Match State ////

export interface Case {
    readonly input: unknown | ((input: unknown) => boolean)
    readonly output: unknown | ((input: unknown) => unknown)
    readonly default: boolean
}

export interface MatchCases {
    cases: readonly Case[]
}

export interface MatchState extends MatchCases {
    values: readonly unknown[]
}

//// Match ////

export interface MatchBuilder extends MatchState {

    case(input: unknown, output: unknown): MatchBuilder 

    default(output: unknown): Match

}

export interface Match extends MatchCases {

    (value: unknown): unknown

    value(value: unknown): unknown

}

//// Iterable Match ////

export interface MatchIterableEmptyBuilder extends MatchState {

    case(input: unknown, output: unknown): MatchIterableBuilder 

}

export interface MatchIterableBuilder extends MatchIterableEmptyBuilder {

    default(output: unknown): MatchIterable

}

export interface MatchIterable extends Match, MatchState {

    [Symbol.iterator](): Generator<unknown>

}

