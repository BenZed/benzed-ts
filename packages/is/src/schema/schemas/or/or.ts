import { Primitive, TypeGuard } from '@benzed/util'

import {
    Boolean, 
    Number, 
    String, 

    InstanceInput,
    Instance,
    isBoolean,
    isString,
    isNumber,
} from '../type'

import { 
    Union, 
} from './union'

import Schematic, { 
    AnySchematic, 
    ToSchematic, 
    ToSchematicInput 
} from '../../schematic'

import { _Factory } from '../../../is'

import { Value } from '../value'
import { isArray, Array } from '../type-of'
import { CallableStruct } from '@benzed/immutable/src'

//// Eslint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Helper Types ////

type _UniqueValues<T extends readonly unknown[], V extends Primitive> = T extends [infer T1, ...infer Tr]
    ? T1 extends V
        ? [T1, ...Tr]
        : Tr extends [] 
            ? [...T, V]
            : [T1, ..._UniqueValues<Tr, V>]
    : [V]

type _FlattenSchematics<T extends readonly unknown[]> = T extends [infer T1, ...infer Tr]
    ? T1 extends Union<infer Tx>  
        ? _FlattenSchematics<[...Tx, ...Tr]>
        :[T1, ..._FlattenSchematics<Tr>]
    : []

type _MergeSchematics<T extends readonly unknown[], V extends Primitive[] = []> = T extends [infer T1, ...infer Tr]
    ? Tr['length'] extends 0
        ? T1 extends Value<infer Vx> 
            ? _ResolveSchematics<_UniqueValues<V, Vx>>
            : [T1, ..._ResolveSchematics<V>]
        : T1 extends Value<infer Vx> 
            ? _MergeSchematics<Tr, _UniqueValues<V, Vx>>
            : [T1, ..._MergeSchematics<Tr, V>]
    : []

type _ResolveSchematics<T extends readonly unknown[]> = T extends [infer T1, ...infer Tr]
    ? T1 extends Union<infer Tx> 
        ? [...Tx, ..._ResolveSchematics<Tr>]
        : T1 extends ToSchematicInput
            ? [ToSchematic<T1>, ..._ResolveSchematics<Tr>]
            : never
    : []

type _Or<T extends OrSchematicInput> = _MergeSchematics<_FlattenSchematics<_ResolveSchematics<T>>>

//// Types ////

type OrSchematicInput = ToSchematicInput[] | readonly ToSchematicInput[]
type OrSchematic<T extends OrSchematicInput> = _Or<T> extends infer S 
    ? S extends AnySchematic[] 
        ? S['length'] extends 1 
            ? S[0]
            : Union<S>
        : never
    : never 

interface ToOr<S extends AnySchematic> {
    <T extends Primitive>(value: T): OrSchematic<[S, Value<T>]>
    <T extends InstanceInput>(type: T): OrSchematic<[S, Instance<T>]>
    <T extends AnySchematic>(schema: T): OrSchematic<[S, T]>
    <T extends OrSchematicInput>(...options: T): OrSchematic<[S, ..._ResolveSchematics<T>]>
}

//// Or ////

// class OrOf<U extends Union<AnySchematic[], C extends ChainableCollection> {}

class Or<S extends AnySchematic> extends CallableStruct<ToOr<S>> implements _Factory {

    static to<T extends OrSchematicInput>(...inputs: T): OrSchematic<T> {

        const outputs: AnySchematic[] = []

        const isValueSchematic = Value[Symbol.hasInstance].bind(Value) as TypeGuard<Value<Primitive>>

        const isUnique = (t1: AnySchematic): boolean => 
            !isValueSchematic(t1) ||
            !outputs.filter(isValueSchematic).some(t1.equals)

        for (const input of inputs) {

            const type = Schematic.to(input) as AnySchematic

            const flattened = type instanceof Union 
                ? type.types as AnySchematic[] 
                : [type]

            const unique = flattened.filter(isUnique)

            outputs.push(...unique)
        }

        const output = outputs.length === 1 ? outputs[0] : new Union(...outputs)
        return output as OrSchematic<T>
    }

    constructor(readonly from: S) {
        super((...args: OrSchematicInput) => Or.to(this.from, ...args))
    }

    //// Chain ////
    
    get boolean(): OrSchematic<[S, Boolean]> {
        return Or.to(this.from, isBoolean)
    }

    get string(): OrSchematic<[S, String]> {
        return Or.to(this.from, isString)
    }

    get number(): OrSchematic<[S, Number]> {
        return Or.to(this.from, isNumber)
    }

    get array(): OrSchematic<[S, Array]> {
        return Or.to(this.from, isArray)
    }

    instanceOf<T extends InstanceInput>(
        type: T
    ): OrSchematic<[S, Instance<T>]> {
        return Or.to(this.from, new Instance(type))
    }

}

//// Exports ////

export default Or

export {
    Or,
    OrSchematic,
    OrSchematicInput,

    ToOr
}