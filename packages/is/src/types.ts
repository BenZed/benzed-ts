import { Constructor } from '@benzed/util'

/* eslint-disable 
    @typescript-eslint/indent,
    @typescript-eslint/no-explicit-any
*/

/**
 * Put on every schematic element in order to simplify type-inference.
 * Value is T at compile time, and a type-name at runtime.
 */
const $$type = Symbol('type-of')

/*** Base Types ***/

/**
 * Explicitly typed internal object. Do not export this interface.
 */
interface Typed<T> {
    [$$type]: T
}

type TypeGuard<T> = (input: unknown, ...args: any[]) => input is T

type TypeAssertion<T> = (input: unknown, ...args: any[]) => asserts input is T

/**
 * Value by which the type can be inferred via TypeOf<T>
 */
type Typeable<T> =
    Typed<T> |
    TypeGuard<T> |
    TypeAssertion<T> |
    Constructor<T>

/*** Type Of ***/

type TypeOf<T> = T extends Typed<infer T1>
    ? T1
    : T extends TypeGuard<infer T2>
    ? T2
    : T extends TypeAssertion<infer T3>
    ? T3
    : T extends Constructor<infer T4>
    ? T4
    : unknown

type TypesOf<T extends readonly unknown[]> = {
    [K in keyof T]: TypeOf<T[K]>
}

/*** Example ***/

export {

    Typeable,
    TypeOf,
    TypesOf,
    TypeGuard,
    TypeAssertion,

    Typed,
    $$type

}
