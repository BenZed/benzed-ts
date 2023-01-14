import { 
    isArray as _isArray, 
    isString as _isString, 
    Pipe, 
    Primitive, 
    safeJsonParse, 
    TypeGuard, 
    TypeOf
} from '@benzed/util'

import { 
    AnySchematic, 
    OrSchematic, 
    OrSchematicInput 
} from '../../schematic'

import { 
    ChainableFactory, 
    ChainableSchematicFactory 
} from '../chainable'

import { Or } from '../or'

import { 
    IsInstance, 
    IsInstanceInput, 
    IsString, 
    IsType, 
    IsUnknown, 
    isString
} from '../is-type'

import { IsValue } from '../is-value'
import { Validate } from '../../../validator'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types //// 

export type IsArrayInput = TypeGuard<unknown>

interface ToArrayOf {
    <T extends Primitive>(value: T): IsArrayOf<IsValue<T>>
    <T extends IsInstanceInput>(type: T): IsArrayOf<IsInstance<T>>
    <T extends AnySchematic>(schema: T): IsArrayOf<T>
    <T extends OrSchematicInput>(...options: T): IsArrayOf<OrSchematic<T>>
}

//// Exports ////

class ArrayOf<F extends IsArray> extends ChainableSchematicFactory<ToArrayOf> 
    implements ChainableFactory {

    constructor(readonly from: F) {
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

        type O = TypeOf<T>[]

        const isArrayOf = new IsArrayOf(schematic)
        const validators = Pipe
            .flatten([this.from.validate])
            .slice(1) as Validate<O>[]

        return validators.length > 0 
            ? isArrayOf.validates(...validators)
            : isArrayOf
    }
}

class IsArrayOf<T extends IsArrayInput> 
    extends IsType<TypeOf<T>[]> {

    /**
     * @internal
     */
    constructor()
    constructor(item: T)
    constructor(readonly item?: T) {
        type O = TypeOf<T>[]

        super({
            type: 'array',

            is: (i: unknown): i is O =>
                _isArray(i, this.item),

            cast: (i: unknown): unknown =>
                _isString(i) 
                    ? safeJsonParse(i, this.is) 
                    : i
        })
    }

}

class IsArray extends IsArrayOf<IsUnknown> {

    constructor() {
        super()
    }

    get of(): ArrayOf<this> {
        return new ArrayOf(this)
    }

}

//// Exports ////

export default ArrayOf

export {
    ArrayOf,
    IsArray,
    IsArrayOf
}

export const isArray = new IsArray