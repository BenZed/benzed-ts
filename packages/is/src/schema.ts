import { Typeable, TypeOf } from './types'
import { F, Flags, DefaultFlags } from './flags'

import { TypeMethod, IsMethod, AssertMethod, ValidateMethod, ATS } from './type-methods'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/indent 
*/

/*** Schema Types ***/

type Schema<F extends Flags = any, T = any> = TypeMethod<F[0], T> & {
    is: F[0] extends F.Is ? never : IsMethod<T>
    assert: F[0] extends F.Assert ? never : AssertMethod<T, ATS.Off>
    validate: F[0] extends F.Validate ? never : ValidateMethod<F>
}

type SchemaFactory<F extends Flags> = <T extends Typeable<any>>
    (type: T) => Schema<F, TypeOf<T>>

/*** MOVE ME ***/

type ValueSchema<F extends Flags, T> = Schema<F, T> & {

    // get optional(): ValueSchema<[F[0], F[1], F.Optional], T>
    // get required(): ValueSchema<[F[0], F[1], F.Required], T>
    // get readonly(): ValueSchema<[F[0], F.Readonly, F[2]], T>
    // get mutable(): ValueSchema<[F[0], F.Mutable, F[2]], T>

}

type StringSchema<F extends Flags> = ValueSchema<F, string> & {
    length(length: number): StringSchema<F>
    get trim(): StringSchema<F>
}

type BooleanSchema<F extends Flags> = ValueSchema<F, boolean>

type NumberSchema<F extends Flags> = ValueSchema<F, number> & {
    range(length: number): NumberSchema<F>
}

type Schemas<F extends Flags = DefaultFlags> = SchemaFactory<F> & {

    string: StringSchema<F>
    boolean: BooleanSchema<F>
    number: NumberSchema<F>

}

type SchemaOf<K extends keyof Schemas, F extends Flags> = Schemas<F>[K]

type Is = Schemas<[F.Is, F.Readonly, F.Required]>
type Validate = Schemas<[F.Validate, F.Readonly, F.Required]>
type Assert = Schemas<[F.Assert, F.Readonly, F.Required]>

/*** Temp ***/

const is: Is = null as unknown as Is
const assert: Assert = null as unknown as Assert
const validate: Validate = null as unknown as Validate

/*** Exports ***/

export {

    is,
    Is,

    assert,
    Assert,

    validate,
    Validate

}