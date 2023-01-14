import { 
    Pipe, 
    Primitive, 
    TypeOf
} from '@benzed/util'

import { 
    AnySchematic, 
    OrSchematic, 
    OrSchematicInput 
} from '../../../schematic'

import { 
    ChainableFactory, 
    SchematicFactory, 
} from '../../chainable'

import { Or } from '../../or'

import { 
    IsInstance, 
    IsInstanceInput, 
    IsString, 
    isString
} from '../../is-type'

import { IsValue } from '../../is-value'
import { IsArray } from './is-array'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types //// 

interface ToArrayOf {
    <T extends Primitive>(value: T): IsArray<IsValue<T>>
    <T extends IsInstanceInput>(type: T): IsArray<IsInstance<T>>
    <T extends AnySchematic>(schema: T): IsArray<T>
    <T extends OrSchematicInput>(...options: T): IsArray<OrSchematic<T>>
}

//// Exports ////

class ArrayOf extends SchematicFactory<ToArrayOf> implements ChainableFactory {

    constructor() {
        super((...options: OrSchematicInput) => 
            this._toArrayOf(Or.to(...options)) as IsArray<any>
        )
    }

    get string(): IsArray<IsString> {
        return this._toArrayOf(isString)
    }

    // Helper 

    private _toArrayOf<T extends AnySchematic>(
        schematic: T
    ): IsArray<T> {
        return new IsArray(schematic)
    }
}

//// Exports ////

export default ArrayOf

export {
    ArrayOf
}

export const arrayOf = new ArrayOf