import { DefaultFlags, SetFlag, Flags, Flag } from './flags'

import { TypeMethod, IsMethod, AssertMethod, ValidateMethod } from './type-methods'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/indent 
*/

/*** Schema Types ***/

type Schema<T = any, F extends Flags = DefaultFlags> = TypeMethod<T, F[0]> & {
    get is(): IsMethod<T>
    get assert(): AssertMethod<T>
    get validate(): ValidateMethod<T>
}

/*** MOVE ME ***/

type ValueSchema<T, F extends Flags> = Schema<T, F> & {

    get optional(): ValueSchema<T, SetFlag<F, Flag.Optional>>
    get required(): ValueSchema<T, SetFlag<F, Flag.Required>>
    get readonly(): ValueSchema<T, SetFlag<F, Flag.Readonly>>
    get mutable(): ValueSchema<T, SetFlag<F, Flag.Mutable>>

}

type StringSchema<F extends Flags> = ValueSchema<string, F> & {

    length(length: number): StringSchema<F>

    get trim(): StringSchema<F>

}

type BooleanSchema<F extends Flags> = ValueSchema<boolean, F>

type NumberSchema<F extends Flags> = ValueSchema<number, F> & {

    range(length: number): NumberSchema<F>

}

type ArraySchema<T, F extends Flags> = ValueSchema<T[], F>

/*** Exports ***/

export {

    Schema,

    StringSchema,
    BooleanSchema,
    NumberSchema,
    ArraySchema

}