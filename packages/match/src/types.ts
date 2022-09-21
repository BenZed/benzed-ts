import type { TypeGuard } from '@benzed/util'

/* 
    eslint-disable 
    @typescript-eslint/indent, 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/explicit-function-return-type
*/

/*** Helper Types ***/

type Predicate<T> = (input: T) => boolean

/*** Values ***/

type DiscardValue<V, I> =
    I extends TypeGuard<any, infer O>
    ? Exclude<V, O>
    : Exclude<V, I>

type KeepValue<V, I> =
    I extends TypeGuard<any, infer O>
    ? Extract<V, O>
    : V

type BreakValue<V, I> =
    I extends TypeGuard<any, infer O>
    ? Exclude<V, O>
    : V

// nested in .value to prevent ugliness
type FallValue<V, I, O> = { value: BreakValue<V, I> | O }['value']

/*** Exports ***/

/**
* Add type to output if it doesn't exist already
*/

type AddOutput<ON, O extends readonly unknown[]> =
    O extends [infer O1, ...infer OR]
    ? ON extends O1 ? O : [O1, ...AddOutput<ON, OR>]
    : [ON]

type OutputMethod<V, I, O> = I extends TypeGuard<any, infer I2>
    ? (input: I2) => O
    : (input: V) => O

export type OutputOptions<V, I, O> =
    OutputMethod<V, I, O> | O

type IfOutputTarget<OT, Y, N> = OT extends void ? N : Y

export type OutputTarget<OT> = IfOutputTarget<OT, OT, unknown>

export type OutputArray<A extends readonly unknown[] = unknown[]> = A

export type InputOptions<T> = Predicate<T> | TypeGuard<T, T> | T

export type MatchOutput<OT, O extends OutputArray> = O extends []
    ? never
    : IfOutputTarget<OT, OT, O extends [infer O1]
        ? O1
        : O extends [infer O1, ...infer ON]
        ? O1 | MatchOutput<OT, ON>
        : never
    >

type BreakOutputMethod<O1, V> = TypeGuard<unknown, O1> | ((input: V) => O1)

type FuncIfOutput<O, R> = O extends never ? never : () => R

export interface MatchFinalized<O> {

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

export interface Match<
    V,
    O extends OutputArray,
    OT = void

> extends MatchFinalized<MatchOutput<OT, O>> {

    /**
     * Create new case that breaks on match.
     */
    <O1 extends OutputTarget<OT>, I extends InputOptions<V>>(
        input: I,
        output: OutputOptions<V, I, O1>
    ): Match<BreakValue<V, I>, AddOutput<O1, O>, OT>

    <O1 extends OutputTarget<OT>, I extends InputOptions<V>>(
        defaultOutput: OutputOptions<V, I, O1>
    ): MatchFinalized<
        MatchOutput<
            OT,
            AddOutput<O1, O>
        >
    >

    /**
     * Create new case that breaks on match.
     */
    break<O1 extends OutputTarget<OT>, I extends InputOptions<V>>(
        input: I,
        output: OutputOptions<V, I, O1>
    ): Match<BreakValue<V, I>, AddOutput<O1, O>, OT>

    /**
     * Create new case that breaks on match.
     */
    break<O1 extends OutputTarget<OT>>(
        pass: BreakOutputMethod<O1, V>
    ): Match<
        Exclude<V, O1>,
        AddOutput<
            O1,
            O
        >,
        OT
    >

    /**
     * Create a new case that passes the output to input on match
     */
    fall<O1, I extends InputOptions<V>>(
        input: I,
        output: OutputOptions<V, I, O1>
    ): Match<FallValue<V, I, O1>, O, OT>
    fall<O1, I extends InputOptions<V>>(
        pass: OutputMethod<V, I, O1>
    ): Match<O1, O, OT>

    /**
     * Do not create outputs for the match
     * @param input 
     */
    discard<I extends InputOptions<V>>(
        input: I
    ): Match<DiscardValue<V, I>, O, OT>
    discard(): Match<never, O, OT>

    /**
     * Only create outputs for this match
     * @param input 
     */
    keep<I extends InputOptions<V>>(
        input: I
    ): Match<KeepValue<V, I>, O, OT>

    /**
     * Create a final case that handles any remaining cases
     */
    default<O1 extends OutputTarget<OT>, I extends InputOptions<V>>(
        output: OutputOptions<V, I, O1>
    ): MatchFinalized<
        MatchOutput<
            OT,
            AddOutput<V, O>
        >
    >

    default(): MatchFinalized<
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
        MatchFinalized<
            MatchOutput<
                OT,
                AddOutput<V, O>
            >
        >
    >

}
