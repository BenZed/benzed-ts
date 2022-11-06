import { Typed } from './types'
import { Flag } from './flags'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/indent 
*/

/*** Type Methods ***/

/*** Types ***/

interface AssertMethod<T> extends Typed<T> {
    (input: unknown): asserts input is T
}

interface IsMethod<T> extends Typed<T> {
    (input: unknown): input is T
}

interface ValidateMethod<T> extends Typed<T> {
    (input: unknown): T
}

type TypeMethod<T, F extends Flag.Is | Flag.Assert | Flag.Validate> =
    F extends Flag.Is
    ? IsMethod<T>

    : F extends Flag.Assert
    ? AssertMethod<T>

    : F extends Flag.Validate
    ? ValidateMethod<T>
    : never

/*** Exports ***/

export default TypeMethod

export {
    TypeMethod,

    IsMethod,
    ValidateMethod,
    AssertMethod,

}