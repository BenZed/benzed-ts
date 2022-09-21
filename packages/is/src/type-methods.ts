import { Typed } from './types'
import { F } from './flags'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/indent 
*/

/*** Type Methods ***/

/**
 * Assertion Type Safety 
 * 
 * Typescript requires all assertion methods to be explicitly 
 * declared, which screws up this library's ability to transition
 * one method into another. This is a work around to keep the run
 * time assertion functionality while losing it's type safety
 */
enum AssertionTypeSafety {

    /**
     * Assert methods will be given the 
     * <T>(i) => asserts i is T
     * signature
     */
    On,

    /**
     * Assert methods will be given the
     * (i) => void
     * signature.
     */
    Off
}

/*** Types ***/

type AssertMethod<T, A extends AssertionTypeSafety = AssertionTypeSafety.On> = Typed<T> &
    (A extends AssertionTypeSafety.On
        ? (input: unknown) => asserts input is T
        : (input: unknown) => void)

type IsMethod<T> = Typed<T> & ((input: unknown) => input is T)

type ValidateMethod<T> = Typed<T> & ((input: unknown) => T)

type TypeMethod<F extends F.Is | F.Assert | F.Validate, T> =
    F extends F.Is
    ? IsMethod<T>

    : F extends F.Assert
    ? AssertMethod<T>

    : F extends F.Validate
    ? ValidateMethod<T>

    : unknown

/*** Exports ***/

export default TypeMethod

export {
    TypeMethod,

    IsMethod,
    ValidateMethod,
    AssertMethod,

    AssertionTypeSafety,
    AssertionTypeSafety as ATS,
}