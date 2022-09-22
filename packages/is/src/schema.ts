import { Typeable, Typed, TypeOf, TypesOf } from './types'
import { F, Flags, DefaultFlags } from './flags'

import { TypeMethod, IsMethod, AssertMethod, ValidateMethod, ATS } from './type-methods'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/indent 
*/

/*** Schema Types ***/

type Schema<T = any, F extends Flags = DefaultFlags> = TypeMethod<T, F[0]> & {
    is: IsMethod<T>
    assert: AssertMethod<T, ATS.Off>
    validate: ValidateMethod<T>
}

type SchemaFactory<F extends Flags> =
    <T extends Typeable<any>>(type: T) => Schema<TypeOf<T>, F>

/*** MOVE ME ***/

type ValueSchema<T, F extends Flags> = Schema<T, F> & {

    get optional(): ValueSchema<T, [F[0], F[1], F.Optional]>
    get required(): ValueSchema<T, [F[0], F[1], F.Required]>
    get readonly(): ValueSchema<T, [F[0], F.Readonly, F[2]]>
    get mutable(): ValueSchema<T, [F[0], F.Mutable, F[2]]>

} & {
    or: OrSchema<T, F>
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

type Schemas<F extends Flags = DefaultFlags> = SchemaFactory<F> & {

    string: StringSchema<F>
    boolean: BooleanSchema<F>
    number: NumberSchema<F>
    array: ArraySchema<unknown, F>

    or: OrSchema<void, F>
}

type OrSchemaFactory<F extends Flags> =
    <S extends readonly Typeable<any>[]>(...types: S) => OrSchema<TypesOf<S>[number], F>

type OrSchema<T, F extends Flags> = TypeMethod<T, F[0]> & OrSchemaFactory<F> & {

    [K in keyof Schemas<F> as K extends 'or' ? never : K]: K extends 'or'
    ? never
    : Chain<K, 'or', T, F>

}

type Chain<
    K1 extends keyof Schemas<F>,
    K2 extends keyof Schemas<F>,
    T,
    F extends Flags = DefaultFlags
> = ((...args: Parameters<Schemas<F>[K2]>) => ReturnType<Schemas<F>[K2]>) & {
    [K in keyof Schemas<F>[K1]]: K2 extends keyof Schemas<F>[K1]
    ? K2 extends 'or'
    ? OrSchema<T | TypeOf<Schemas<F>[K1][K2]>, F>
    : K2 extends 'array'
    ? ArraySchema<T[], F>
    : Schemas<F>[K1][K]
    : never
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