import { TypeGuard } from '@benzed/util'
import { TypeValidatorSettings } from '../../../validator'
import { Type } from '../type'

//// Exports ////

export type AnyTypeGuard = TypeGuard<unknown>

export interface TypeOfSettings<O extends AnyTypeGuard, T> extends TypeValidatorSettings<T> {

    readonly of: O

}

export abstract class TypeOf<O extends AnyTypeGuard, T> extends Type<T> {

    readonly of: O

    constructor({ of, ...settings }: TypeOfSettings<O, T>) {
        super(settings)
        this.of = of
    }
}

