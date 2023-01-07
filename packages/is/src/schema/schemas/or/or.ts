import { Infer } from '@benzed/util'

import {
    IsBoolean, 
    IsNumber, 
    IsString, 
    IsEnum, 
    IsEnumInput,
    IsInstanceInput,
    IsInstance
} from '../is-type'

import Schema from '../../schema'

import { IsUnion, IsUnionFlatten } from './is-union'
import { ChainableSchemaFactory, ChainableSchemaFactoryInterface } from '../chainable-schema'

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

class Or<S extends Schema> 
    extends ChainableSchemaFactory<IsUnionFrom<S>> 
    implements ChainableSchemaFactoryInterface {

    constructor(readonly from: S) {
        super((...args: Parameters<IsUnionFrom<S>>) => 
            this._toIsUnion(Schema.from(...args)) as any
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

    enum<E extends IsEnumInput>(
        ...options: E
    ): ToIsUnion<S, IsEnum<E>> {
        return this._toIsUnion(new IsEnum(...options))
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