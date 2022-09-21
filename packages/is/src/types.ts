import { Constructor } from '@benzed/util'

/* eslint-disable 
    @typescript-eslint/indent 
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

/**
 * Value by which the type can be inferred via TypeOf<T>
 */
type Typeable<T> = Constructor<T> | Typed<T>

/*** Type Of ***/

type TypeOf<T> = T extends Typed<infer T1>
    ? T1
    : T extends Constructor<infer T2>
    ? T2
    : unknown

type TypesOf<T extends readonly Typed<unknown>[]> = {
    [K in keyof T]: TypeOf<T[K]>
}

/*** Example ***/

export {

    Typeable,
    TypeOf,
    TypesOf,

    Typed,
    $$type

}
