import { Last } from '@benzed/array'
import { TypeGuard, TypeOf, TypesOf, nil, Infer, Func } from '@benzed/util'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Test Types ////

export interface Schematic<T> extends TypeGuard<T> {
    validate(input: unknown): T
}

export type AnySchematic = Schematic<any>

export interface Str extends Schematic<string> {
    get trim(): this
    length(compare: '>' | '<' | '==', number: number): this
}
export interface Bool extends Schematic<boolean> {}
export interface Num extends Schematic<number> {
    range(compare: '>' | '<' | '==', number: number): this
}
export interface Unknown extends Schematic<unknown> {}

type ArrayOutput<T extends AnySchematic> = Infer<TypeOf<T>[]>
export interface ArrayOf<T extends AnySchematic> extends Schematic<ArrayOutput<T>> {
    length(compare: '>' | '<' | '==', number: number): this
}

export interface Array extends ArrayOf<Unknown> {}

type ShapeInput = Record<string | number | symbol, AnySchematic>
type ShapeOutput<T extends ShapeInput> = {
    [K in keyof T]: TypeOf<T[K]>
}
type InShape<T extends ShapeInput> = Infer<{
    [K in keyof T]: _IsUnwrap<T[K]>
}, ShapeInput>

export interface Shape<T extends ShapeInput> extends Schematic<ShapeOutput<T>> {}

export interface MultiSchematic<S extends AnySchematic[], T> extends Schematic<T> {
    types: S
}

export type AnyMultiSchematic = MultiSchematic<any,any>
export type AnyContainer = AnyMultiSchematic

//// Factories ////

export interface IS {
    <T extends AnySchematic>(type: T): Is<_IsUnwrap<T>>

    get string(): Is<Str>
    get number(): Is<Num>
    get boolean(): Is<Bool>
    get array(): Is<Array>
    arrayOf<T extends AnySchematic>(type: T): Is<ArrayOf<_IsUnwrap<T>>>
    shape<T extends ShapeInput>(type: T): Is<Shape<InShape<T>>>
}

export interface OR<S extends AnySchematic[]> {
    <T extends AnySchematic>(type: T): Is<Or<[...S, ..._IsUnwrap<T> extends Or<infer Tx> ? Tx : [_IsUnwrap<T>]]>>

    get string(): Is<Or<[...S, Str]>>
    get number(): Is<Or<[...S, Num]>>
    get boolean(): Is<Or<[...S, Bool]>>
    get array(): Is<Or<[...S, Array]>>
    arrayOf<T extends AnySchematic>(type: T): Is<Or<[...S, ArrayOf<_IsUnwrap<T>>]>>
    shape<T extends ShapeInput>(type: T): Is<Or<[...S, Shape<T>]>>
}

//// Is ////

type _Fill<A,B> = {
    [K in keyof A | keyof B]: K extends keyof A 
        ? A[K] 
        : K extends keyof B 
            ? B[K] 
            : never
}

type _IsUnwrap<T extends AnySchematic> = 
    T extends Is<infer Tx> ? Tx : T

//// Is ////

type _InheritIs<T> = T extends AnySchematic 
    ? Is<T> 
    : T extends Func
        ? ReturnType<T> extends AnySchematic 
            ? (...params: Parameters<T>) => Is<ReturnType<T>>
            : T
        : T
export type Is<T extends AnySchematic> = 
    Schematic<TypeOf<T>> 
    & _Fill<{
        [K in keyof T]: _InheritIs<T[K]>
    }, {
        or: OR<T extends Or<infer Tx> ? Tx : [T]>
        optional: Is<Optional<T>>
        readonly: Is<Readonly<T>>
    }>

//// Or ////

type _InheritOr<S, T extends AnySchematic[]> = S extends AnySchematic 
    ? Or<T>
    : S extends Func
        ? ReturnType<S> extends AnySchematic 
            ? (...params: Parameters<S>) => Or<T>
            : S
        : S
export type Or<T extends AnySchematic[]> = Schematic<TypesOf<T>[number]> & {
    [K in keyof Last<T>]: _InheritOr<Last<T>[K], T>
} & {
    types: T
}

//// Modifiers ////

type _InheritOptional<T> = T extends AnySchematic 
    ? Optional<T> 
    : T extends Func
        ? ReturnType<T> extends AnySchematic 
            ? (...params: Parameters<T>) => Optional<ReturnType<T>>
            : T
        : T
export type Optional<T extends AnySchematic> = Schematic<TypeOf<T> | nil> & {
    [K in keyof T]: _InheritOptional<T[K]>
} & {
    optional: Optional<T>
    required: T
}

type _InheritReadonly<T> = T extends AnySchematic 
    ? Optional<T> 
    : T extends Func
        ? ReturnType<T> extends AnySchematic 
            ? (...params: Parameters<T>) => Optional<ReturnType<T>>
            : T
        : T
export type Readonly<T extends AnySchematic> = Schematic<TypeOf<T>> & {
    [K in keyof T]: _InheritReadonly<T[K]>
} & {
    readonly: Readonly<T>
    writable: T
}