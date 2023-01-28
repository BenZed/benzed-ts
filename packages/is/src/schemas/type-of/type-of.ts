import { TypeGuard } from '@benzed/util'

import { TypeValidatorSettings } from '../../../../schema/src/validator'
import { Type } from '../type/type'

//// Exports ////

export type AnyTypeOf = TypeOf<AnyTypeGuard, unknown>

export type AnyTypeGuard = TypeGuard<unknown>

export interface TypeOfSettings<O extends AnyTypeGuard, T> 
    extends TypeValidatorSettings<T> {

    readonly of: O
}

export abstract class TypeOf<O extends AnyTypeGuard, T> extends Type<T> {

    get of(): O {
        const type = this.typeValidator
        return (type as unknown as TypeOfSettings<O, T>).of
    }

    constructor(settings: TypeOfSettings<O, T>) {
        super(settings)
    }
}

