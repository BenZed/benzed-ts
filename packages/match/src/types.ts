import type { Func, TypeGuard } from '@benzed/util'

/* 
    eslint-disable 
    @typescript-eslint/indent, 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/explicit-function-return-type
*/

//// Helper Types ////

type Predicate<T> = (input: T) => boolean

//// Values ////

type DiscardValue<V, I> =
    I extends TypeGuard<infer O, any>
    ? Exclude<V, O>
    : Exclude<V, I>

type KeepValue<V, I> =
    I extends TypeGuard<infer O, any>
    ? Extract<V, O>
    : V

type BreakValue<V, I> =
    I extends TypeGuard<infer O, any>
    ? Exclude<V, O>
    : I extends Func<any,any,any> ? V : Exclude<V,I>

// nested in .value to prevent ugliness
type FallValue<V, I, O> = { 
    value: BreakValue<V, I> | O 
}['value']

//// Exports ////

/**
* Add type to output if it doesn't exist already
*/

type AddOutput<ON, O extends readonly unknown[]> =
    O extends [infer Ox, ...infer OR]
    ? ON extends Ox ? O : [Ox, ...AddOutput<ON, OR>]
    : [ON]

type OutputMethod<V, I, O> = I extends TypeGuard<infer Ix, any>
    ? (input: Ix) => O
    : (input: V) => O

export type OutputOptions<V, I, O> =
    OutputMethod<V, I, O> | O

type IfOutputTarget<OT, Y, N> = OT extends void ? N : Y

export type OutputTarget<OT> = IfOutputTarget<OT, OT, unknown>

export type OutputArray<A extends readonly unknown[] = unknown[]> = A

export type InputOptions<T> = Predicate<T> | TypeGuard<T, T> | T

export type MatchOutput<OT, O extends OutputArray> = O extends []
    ? never
    : IfOutputTarget<OT, OT, O extends [infer Ox]
        ? Ox
        : O extends [infer Ox, ...infer ON]
        ? Ox | MatchOutput<OT, ON>
        : never
    >

type BreakOutputMethod<Ox, V> = TypeGuard<Ox, any> | ((input: V) => Ox)

type FuncIfOutput<O, R, A extends unknown[] = []> = O extends never ? never : (...args: A) => R

export interface Match<O> {

    /**
     * Iterate output provided output cases are not empty
     */
    [Symbol.iterator]: FuncIfOutput<O, Iterator<O>>

    /**
     * Returns the next output
     */
    next: FuncIfOutput<O, O>

    /**
     * Returns the remaining outputs as an array
     */
    rest: FuncIfOutput<O, O[]>

}

export interface MatchInProgress<
    V,
    O extends OutputArray,
    OT = void

> extends Match<MatchOutput<OT, O>> {

    /**
     * Create new case that breaks on match.
     */
    <Ox extends OutputTarget<OT>, I extends InputOptions<V>>(
        input: I,
        output: OutputOptions<V, I, Ox>
    ): MatchInProgress<BreakValue<V, I>, AddOutput<Ox, O>, OT>

    <Ox extends OutputTarget<OT>, I extends InputOptions<V>>(
        defaultOutput: OutputOptions<V, I, Ox>
    ): Match<
        MatchOutput<
            OT,
            AddOutput<Ox, O>
        >
    >

    /**
     * Create new case that breaks on match.
     */
    break<Ox extends OutputTarget<OT>, I extends InputOptions<V>>(
        input: I,
        output: OutputOptions<V, I, Ox>
    ): MatchInProgress<BreakValue<V, I>, AddOutput<Ox, O>, OT>

    /**
     * Create new case that breaks on match.
     */
    break<Ox extends OutputTarget<OT>>(
        pass: BreakOutputMethod<Ox, V>
    ): MatchInProgress<
        Exclude<V, Ox>,
        AddOutput<
            Ox,
            O
        >,
        OT
    >

    /**
     * Create a new case that passes the output to input on match
     */
    fall<Ox, I extends InputOptions<V>>(
        input: I,
        output: OutputOptions<V, I, Ox>
    ): MatchInProgress<FallValue<V, I, Ox>, O, OT>
    
    fall<Ox, I extends InputOptions<V>>(
        pass: OutputMethod<V, I, Ox>
    ): MatchInProgress<Ox, O, OT>

    /**
     * Do not create outputs for the match
     * @param input 
     */
    discard<I extends InputOptions<V>>(
        input: I
    ): MatchInProgress<DiscardValue<V, I>, O, OT>
    discard(): MatchInProgress<never, O, OT>

    /**
     * Only create outputs for this match
     * @param input 
     */
    keep<I extends InputOptions<V>>(
        input: I
    ): MatchInProgress<KeepValue<V, I>, O, OT>

    /**
     * Create a final case that handles any remaining cases
     */
    default<Ox extends OutputTarget<OT>, I extends InputOptions<V>>(
        output: OutputOptions<V, I, Ox>
    ): Match<
        MatchOutput<
            OT,
            AddOutput<V, O>
        >
    >

    default(): Match<
        MatchOutput<
            OT,
            AddOutput<V, O>
        >
    >

    /**
     * Prevent any further cases from being added
     */
    finalize: FuncIfOutput<
        O[number],
        Match<
            MatchOutput<
                OT,
                AddOutput<V, O>
            >
        >
    >
}
