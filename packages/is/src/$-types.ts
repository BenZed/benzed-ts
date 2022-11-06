import { Typeable, TypeOf } from './types'
import { Flags, F, SetFlag, IsFlag } from './flags'

import { Compile, Intersect } from '@benzed/util'
import { Schema } from './schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/indent 
*/

// TODO MOVE ME

type IfVoid<T, Y, N = T> = T extends void ? Y : N

type Last<T extends readonly unknown[]> = T extends [...unknown[], infer L]
    ? L
    : T[0]

type First<T extends readonly unknown[]> = T extends [infer F, ...unknown[]]
    ? F
    : T[0]

type Pop<T extends readonly unknown[]> = T extends [...infer B, any] ? B : []

/*** Terms ***/

type $ValueTerms = {

    string: {
        type: string
        next: 'or' | keyof $FlagTerms
        stay: ['length', 'trim']
    }

    boolean: {
        type: boolean
        next: 'or' | keyof $FlagTerms
        stay: []
    }

    integer: {
        type: number
        next: 'or' | keyof $FlagTerms
        stay: ['range']
    }

    number: {
        type: number
        next: 'or' | keyof $FlagTerms
        stay: ['range', 'round']
    }

    date: {
        type: Date
        next: 'or' | keyof $FlagTerms
        stay: ['range']
    }

    regexp: {
        type: RegExp
        next: 'or' | keyof $FlagTerms
        stay: []
    }

    promise: {
        type: Promise<unknown>
        next: 'or' | keyof $FlagTerms
        stay: ['length', 'trim']
    }

    null: {
        type: null
        next: 'or' | keyof $FlagTerms
        stay: []
    }

    undefined: {
        type: undefined
        next: 'or' | keyof $FlagTerms
        stay: []
    }

}

type $ContainerTerms = {

    array: {
        next: 'of' | 'or' | keyof $FlagTerms
        stay: ['length']
    }

    record: {
        next: 'of' | 'or' | 'and' | keyof $FlagTerms
        stay: ['strict']
    }

    shape: {
        next: never
        stay: []
    }

    tuple: {
        next: never
        stay: []
    }

}

type $FlagTerms = {

    optional: {
        next: Exclude<keyof $Terms, 'optional'>
        flag: F.Optional
    }

    mutable: {
        next: Exclude<keyof $Terms, 'mutable'>
        flag: F.Mutable
    }

    readonly: {
        next: Exclude<keyof $Terms, 'readonly'>
        flag: F.Readonly
    }

    required: {
        next: Exclude<keyof $Terms, 'required'>
        flag: F.Required
    }
}

type $OpTerms = {

    of: {
        next: keyof $ContainerTerms | keyof $ValueTerms
        stay: []
    }

    or: {
        next: keyof $ContainerTerms | keyof $ValueTerms
        stay: []
    }

    and: {
        next: 'record' | 'shape'
        stay: []
    }

}

type $Terms = $ValueTerms & $ContainerTerms & $OpTerms & $FlagTerms

/*** Structure ***/

type $ShapeType = { [key: string]: Typeable<unknown> }

type $Type = Typeable<unknown> | $ShapeType

type $TypeOf<T> = T extends Typeable<unknown>
    ? TypeOf<T>

    : T extends $ShapeType
    ? Compile<{
        [K in keyof T]: TypeOf<T[K]>
    }>

    : unknown

type $Types = readonly $Type[]

type $TypesOf<T extends $Types> = {
    [K in keyof T]: $TypeOf<T[K]>
}

/*** Mapping ***/

type $NextTerm<TERMS extends readonly unknown[], T extends keyof $Terms> =
    Last<TERMS> extends keyof $Terms
/*   */ ? T extends $Terms[Last<TERMS>]['next']
/*       */ ? T
/*   */ : never

    : TERMS extends []
/*   */ ? T extends 'of'
/*       */ ? never
/*   */ : T

    : T extends $ValueTerms[keyof $ValueTerms]['next']
/*   */ ? T
/*   */ : never

type $Chain<F extends Flags, TERMS extends readonly unknown[]> = {

    [T in keyof $Terms as $NextTerm<TERMS, T>]:

    T extends keyof $FlagTerms
    ? $<SetFlag<F, $FlagTerms[T]['flag']>, [...TERMS, T]>

    : T extends keyof $ValueTerms
    ? $<F, [$Output<[...TERMS, $Terms[T]['type']], F>]>

    : $<F, [...TERMS, T]>

}

type $Call<F extends Flags, TERMS extends readonly unknown[]> =
    Last<TERMS> extends 'of'
    ? <T1 extends $Type>(type: T1) => $<F, [...TERMS, $TypeOf<T1>]>

    : Last<TERMS> extends 'and'
    ? <TN extends $Types>(...types: TN) =>
        $<F, [...TERMS, Intersect<$TypesOf<TN>>]>

    : Last<TERMS> extends 'or'
    ? <TN extends $Types>(...types: TN) =>
        $<F, [...TERMS, $TypesOf<TN>[number]]>

    : Last<TERMS> extends 'shape'
    ? <TN extends $ShapeType>(shape: TN) =>
        $<F, [...Pop<TERMS>, $TypeOf<TN>]>

    : Last<TERMS> extends 'tuple'
    ? <TN extends $Types>(...tuple: TN) =>
        $<F, [...Pop<TERMS>, $TypesOf<TN>]>

    : TERMS extends []
    ? <TN extends $Types>(...input: TN) =>
        $<F, [TN extends [any] ? $TypeOf<TN[0]> : $TypesOf<TN>]>

    : Schema<$Output<TERMS, F>, F>

type $<F extends Flags, TERMS extends readonly unknown[] = []> = $Chain<F, TERMS> & $Call<F, TERMS>

/*** Output ***/

type $Output<TERMS extends readonly unknown[], F extends Flags> =
    $UnFlag<TERMS> extends [infer T1, ...infer TR]

    ? T1 extends 'array'
    ? $Array<TR, F>

    : T1 extends 'record'
    ? $Record<TR, F>

    : T1 extends keyof $OpTerms
    ? $Output<TR, F>

    : TR extends ['or', ...infer TR3]
    ? T1 | $Output<TR3, F>

    : TR extends ['and', ...infer TR4]
    ? T1 & $Output<TR4, F>

    : ApplyOptionalReadonly<T1, F>

    : void

type ApplyOptional<T, F extends Flags> = IsFlag<F, F.Optional, T | undefined, T>

type ApplyReadonly<T, F extends Flags> =
    IsFlag<

        F,

        F.Readonly,

        T extends Record<any, unknown>
        ? { readonly [K in keyof T]: T[K] }
        : Readonly<T>,

        T
    >

type ApplyOptionalReadonly<T, F extends Flags> = ApplyOptional<ApplyReadonly<T, F>, F>

type $UnFlag<TERMS extends readonly unknown[]> = TERMS extends [infer T1, ...infer TR]
    ? T1 extends keyof $FlagTerms
    ? $UnFlag<TR>
    : [T1, ...$UnFlag<TR>]
    : []

type $Record<T, F extends Flags> = ApplyOptionalReadonly<
    T extends ['of', ...infer TR]
    ? { [key: string]: IfVoid<$Output<TR, F>, unknown> }
    : { [key: string]: unknown },
    F
>

type $Array<T extends readonly unknown[], F extends Flags> =
    ApplyOptionalReadonly<
        T extends ['of', ...infer TR]
        ? IfVoid<$Output<TR, F>, unknown>[]
        : unknown[],
        F
    >

/*** Temp ***/

type Is = $<[F.Is, F.Readonly, F.Required]>
type Assert = $<[F.Assert, F.Readonly, F.Required]>
type Validate = $<[F.Validate, F.Readonly, F.Required]>

/*** Expors ***/

export {
    $,
    Is,
    Assert,
    Validate
}