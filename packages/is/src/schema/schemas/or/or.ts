import { Callable, Infer } from '@benzed/util'

import {
    IsBoolean, 
    IsNumber, 
    IsString, 
    IsEnum, 
    IsEnumInput
} from '../is-type'

import Schema from '../../schema'

import { IsInstanceInput, IsInstance, schemaFrom } from '../../schema-from'
import { IsUnion, IsUnionFlatten } from './is-union'

//// Eslint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

interface IsUnionFrom<S extends Schema> {
    <T extends IsInstanceInput>(type: T): ToIsUnion<S, IsInstance<T>>
    <T extends IsEnumInput>(...options: T): ToIsUnion<S, IsEnum<T>>
    <T extends Schema>(schema: T): ToIsUnion<S, T>
    // tuple shortcut 
    // shape shortcut
}

//// ToIsUnion ////

type ToIsUnion<S extends Schema, T extends Schema> = 
    Infer<IsUnion<[...IsUnionFlatten<S>, ...IsUnionFlatten<T>]>>

//// Or ////

class Or<S extends Schema> extends Callable<IsUnionFrom<S>> {

    constructor(readonly from: S) {
        super((...args: Parameters<IsUnionFrom<S>>) => 
            this._toIsUnion(schemaFrom(...args)) as any
        )
    }

    //// Chain ////
    
    get boolean(): ToIsUnion<S, IsBoolean> {
        return this._toIsUnion(new IsBoolean)
    }

    get string(): ToIsUnion<S, IsString> {
        return this._toIsUnion(new IsString)
    }

    get number(): ToIsUnion<S, IsNumber> {
        return this._toIsUnion(new IsNumber)
    }

    //// Helper ////
    
    private _toIsUnion<T extends Schema>(to: T): ToIsUnion<S, T> {

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
    Or,
    IsUnion
}