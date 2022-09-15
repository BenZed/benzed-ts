import type { Merge, TypeGuard } from '@benzed/util'

/* 
    eslint-disable 
    @typescript-eslint/indent, 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/explicit-function-return-type
*/

/*** Helper Types ***/

type Predicate<T> = (input: T) => boolean

type DiscardValue<V, I> =
    I extends TypeGuard<any, infer T>
    ? Exclude<V, T>
    : Exclude<V, I>

type KeepValue<V, I> =
    I extends TypeGuard<any, infer T>
    ? Extract<V, T>
    : Extract<V, I>

/**
 * Fall should be smart enough to use type guards to eliminate
 * types from the remaining cases and add the Output as 
 * a new case
 */
type FallValue<V, I, O> =
    // Merge<...>['value'] to make the output type nicer
    Merge<[{
        value: DiscardValue<V, I> | O
    }]>['value']

/**
* Add type to output if it doesn't exist already
*/
type EnsureOutput<ON, O extends readonly unknown[]> = O extends [infer O1, ...infer OR]
    ? ON extends O1 ? O : [O1, ...EnsureOutput<ON, OR>]
    : [ON]

type OutputMethod<V, I, O> = I extends TypeGuard<any, infer I2>
    ? (input: I2) => O
    : (input: V) => O

/*** Exports ***/

export type Output<V, I, O> =
    OutputMethod<V, I, O> | O

export type Outputs<A extends readonly unknown[] = unknown[]> = A

export type Input<T> = Predicate<T> | TypeGuard<T, T> | T

export interface MatchFinalized<O extends readonly unknown[]> {

    /**
     * Iterate output provided output cases are not empty
     */
    [Symbol.iterator]: (O extends [] ? never : () => Iterator<O[number]>)

    /**
     * Returns the next output
     */
    next(): O[number]

    /**
     * Returns the remaining outputs as an array
     */
    rest(): O[number][]

}

export interface Match<V, O extends Outputs> extends MatchFinalized<O> {

    /**
     * Create new case that breaks on match.
     */
    <O1, I extends Input<V>>(
        input: I,
        output: Output<V, I, O1>
    ): Match<V, EnsureOutput<O1, O>>

    <O1, I extends Input<V>>(
        defaultOutput: Output<V, I, O1>
    ): MatchFinalized<EnsureOutput<O1, O>>

    /**
     * Create new case that breaks on match.
     */
    break<O1, I extends Input<V>>(
        input: I,
        output: Output<V, I, O1>
    ): Match<V, EnsureOutput<O1, O>>

    /**
     * Create new case that breaks on match.
     */
    break<I extends Input<V>>(
        input: I,
    ): Match<V, EnsureOutput<V, O>>

    /**
     * Create a new case that passes the output to input on match
     */
    fall<O1, I extends Input<V>>(
        input: I,
        output: Output<V, I, O1>
    ): Match<FallValue<V, I, O1>, O>
    fall<O1, I extends Input<V>>(
        pass: OutputMethod<V, I, O1>
    ): Match<O1, O>

    /**
     * Do not create outputs for the match
     * @param input 
     */
    discard<I extends Input<V>>(
        input: I
    ): Match<DiscardValue<V, I>, O>
    discard(): Match<never, O>

    /**
     * Only create outputs for this match
     * @param input 
     */
    keep<I extends Input<V>>(
        input: I
    ): Match<KeepValue<V, I>, O>

    /**
     * Create a final case that handles any remaining cases
     */
    default<O1, I extends Input<V>>(
        output: Output<V, I, O1>
    ): MatchFinalized<EnsureOutput<O1, O>>

    default(): MatchFinalized<EnsureOutput<V, O>>

    /**
     * Prevent any further cases from being added
     */
    finalize: (O extends [] ? never : () => MatchFinalized<O>)

}
