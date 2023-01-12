import { Primitive, TypeOf } from '@benzed/util'

import {
    IsBoolean, 
    IsNumber, 
    IsString, 

    IsInstanceInput,
    IsInstance
} from '../is-type'

import { 
    IsUnion, 
} from './is-union'

import { 
    ChainableSchemaFactory, ChainableSchemaFactoryInterface
} from '../chainable-schema'

import Schema from '../../schema'
import { AnySchematic } from '../../schematic'
import { IsValue } from '../is-value'

import { expectTypeOf, Extends } from 'expect-type'
import { V2 } from '../../../../../math/src'

//// Eslint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

interface IsUnionFrom<S extends AnySchematic> {
    <T extends IsInstanceInput>(type: T): ToUnion<[S, IsInstance<T>]>
    <T extends ToUnionInput>(...options: T): ToUnion<[S, ...T]>
    <T extends AnySchematic>(schema: T): ToUnion<[S, T]>
    // tuple shortcut 
    // shape shortcut
}

//// ToIsUnion ////

type _Unique<T extends readonly unknown[], V extends Primitive> = T extends [infer T1, ...infer Tr]
    ? T1 extends V
        ? [T1, ...Tr]
        : Tr extends [] 
            ? [...T, V]
            : [T1, ..._Unique<Tr, V>]
    : [V]
    type U0 = _Unique<[0,1,2,3,4],0>
    type U1 = _Unique<[0,1,2,3,4],1>
    type U2 = _Unique<[0,1,2,3,4],2>
    type U3 = _Unique<[0,1,2,3,4],3>
    type U4 = _Unique<[0,1,2,3,4],4>
    type U5 = _Unique<[0,1,2,3,4],5>

type _Merge<T extends readonly unknown[], V extends Primitive[] = []> = T extends [infer T1, ...infer Tr]
    ? T1 extends IsUnion<infer Tx>
        ? _Merge<[...Tx, ...Tr], V>
        : T1 extends IsValue<infer Vx> 
            ? _Unique<V, Vx> extends true   
                ? _Merge<[...Tr, IsValue<Vx>], [...V, Vx]>
                : _Merge<Tr, V>
            : [T1, ..._Merge<Tr, V>]
    : []

type ToUnion<T extends readonly unknown[]> = IsUnion<_Merge<T>>

type TU1 = ToUnion<[IsUnion<[IsValue<0>, IsValue<1>]>, IsValue<2>]>
expectTypeOf<TU1>().toMatchTypeOf<IsUnion<[IsValue<0>, IsValue<1>, IsValue<2>]>>()

type TU2 = ToUnion<[IsUnion<[IsValue<0>, IsValue<1>]>, IsUnion<[IsValue<0>, IsValue<1>]>]>
expectTypeOf<TU2>().toMatchTypeOf<IsUnion<[IsValue<0>, IsValue<1>]>>()

type TU3 = ToUnion<[IsValue<0>, IsValue<1>]>

type ToUnionInput = readonly (Primitive | AnySchematic)[]

type _ToUnionTypes<I extends readonly unknown[]> = I extends [infer Ix, ...infer Ir]
    ? Ix extends IsUnion<infer Tx>
        ? [...Tx, ..._ToUnionTypes<Ir>]
        : Ix extends Primitive 
            ? [IsValue<Ix>, ..._ToUnionTypes<Ir>]
            : [Ix, ..._ToUnionTypes<Ir>]
    : []

//// Or ////

class Or<S extends AnySchematic> 
    extends ChainableSchemaFactory<IsUnionFrom<S>> 
    implements ChainableSchemaFactoryInterface {

    constructor(readonly from: S) {
        super((...args: Parameters<IsUnionFrom<S>>) => 
            this._toUnion(Schema.from(...args)) as any
        )
    }

    //// Chain ////
    
    get boolean(): ToUnion<[S, IsBoolean]> {
        return this._toUnion(new IsBoolean)
    }

    get string(): ToUnion<[S, IsString]> {
        return this._toUnion(new IsString)
    }

    get number(): ToUnion<[S, IsNumber]> {
        return this._toUnion(new IsNumber)
    }

    instanceOf<T extends IsInstanceInput>(
        type: T
    ): ToUnion<[S, IsInstance<T>]> {
        return this._toUnion(new IsInstance(type))
    }

    //// Helper ////

    private _toUnion<T extends AnySchematic[]>(...to: T): ToUnion<[S, ...T]> {

        const types = [
            ...IsUnion.flatten(this.from),
            ...IsUnion.flatten(to)
        ] as const

        return new IsUnion(...types)
    }
}

//// Exports ////

export default Or

export {
    Or
}