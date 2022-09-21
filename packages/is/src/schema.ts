import { Typeable, TypeOf } from './types'
import { F, Flags, DefaultFlags } from './flags'

import { TypeMethod, IsMethod, AssertMethod, ValidateMethod, ATS } from './type-methods'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/indent 
*/

/*** Schema Types ***/

type Schema<T = any, F extends Flags = DefaultFlags> = TypeMethod<F[0], T> & {
    is: F[0] extends F.Is ? never : IsMethod<T>
    assert: F[0] extends F.Assert ? never : AssertMethod<T, ATS.Off>
    validate: F[0] extends F.Validate ? never : ValidateMethod<T>
}

type SchemaFactory<F extends Flags> =
    <T extends Typeable<any>>(type: T) => Schema<TypeOf<T>, F>

/*** MOVE ME ***/

type ValueSchema<T, F extends Flags> = Schema<T, F> & {

    get optional(): ValueSchema<T, [F[0], F[1], F.Optional]>
    get required(): ValueSchema<T, [F[0], F[1], F.Required]>
    get readonly(): ValueSchema<T, [F[0], F.Readonly, F[2]]>
    get mutable(): ValueSchema<T, [F[0], F.Mutable, F[2]]>

}

type StringSchema<F extends Flags> = ValueSchema<string, F> & {
    length(length: number): StringSchema<F>
    get trim(): StringSchema<F>
}

type BooleanSchema<F extends Flags> = ValueSchema<boolean, F>

type NumberSchema<F extends Flags> = ValueSchema<number, F> & {
    range(length: number): NumberSchema<F>
}

type Schemas<F extends Flags = DefaultFlags> = SchemaFactory<F> & {

    string: StringSchema<F>
    boolean: BooleanSchema<F>
    number: NumberSchema<F>

}

// type SchemaOf<K extends keyof Schemas, F extends Flags> = Schemas<F>[K]

type Is = Schemas<[F.Is, F.Readonly, F.Required]>
type Assert = Schemas<[F.Assert, F.Readonly, F.Required]>
type Validate = Schemas<[F.Validate, F.Readonly, F.Required]>

/*** Temp ***/

const is: Is = (function is() { /**/ }) as unknown as Is
const assert: Assert = (function assert() { /**/ }) as unknown as Assert
const validate: Validate = (function validate() { /**/ }) as unknown as Validate

/*** Exports ***/

export {

    is,
    Is,

    assert,
    Assert,

    validate,
    Validate,

    Schema,
    SchemaFactory

}