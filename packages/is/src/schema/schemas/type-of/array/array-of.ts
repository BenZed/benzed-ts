import { Primitive } from '@benzed/util'
import { CallableStruct } from '@benzed/immutable'

import { 
    AnySchematic, 
    OrSchematic, 
    OrSchematicInput 
} from '../../../schematic'

import { Or } from '../../or'

import { 
    IsInstance, 
    IsInstanceInput, 
    IsString, 
    isString
} from '../../type'

import { IsValue } from '../../value'
import { _Factory } from '../../../../is'
import { IsArrayOf } from './array'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types //// 

interface ToArrayOf {
    <T extends Primitive>(value: T): IsArrayOf<IsValue<T>>
    <T extends IsInstanceInput>(type: T): IsArrayOf<IsInstance<T>>
    <T extends AnySchematic>(schema: T): IsArrayOf<T>
    <T extends OrSchematicInput>(...options: T): IsArrayOf<OrSchematic<T>>
}

//// Exports ////

class ArrayOf extends CallableStruct<ToArrayOf> implements _Factory {

    constructor() {
        super((...options: OrSchematicInput) => 
            this._toArrayOf(Or.to(...options)) as IsArrayOf<any>
        )
    }

    get string(): IsArrayOf<IsString> {
        return this._toArrayOf(isString)
    }

    // Helper 

    private _toArrayOf<T extends AnySchematic>(
        schematic: T
    ): IsArrayOf<T> {
        return new IsArrayOf(schematic)
    }
}

//// Exports ////

export default ArrayOf

export {
    ArrayOf
}

export const arrayOf = new ArrayOf