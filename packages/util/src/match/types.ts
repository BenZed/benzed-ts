
//// Types ////

export interface Case {
    readonly input: unknown | ((input: unknown) => boolean)
    readonly output: unknown | ((input: unknown) => unknown)
    readonly default: boolean
}

export interface MatchCases {
    cases: readonly Case[]
}

export interface MatchState extends MatchCases{
    values: readonly unknown[]
}

export interface Match_ extends MatchCases {
    (value: unknown): unknown
}

export interface Match extends MatchState, Match_ {

    case(input: unknown, output: unknown): Match

    default(output: unknown): Match

    [Symbol.iterator](): Generator<unknown>
}

