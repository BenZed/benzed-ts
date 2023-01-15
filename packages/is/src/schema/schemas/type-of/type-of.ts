import { TypeGuard } from '@benzed/util'
import { TypeValidatorSettings } from '../../../validator'
import { IsType } from '../type'

//// Exports ////

export type AnyTypeGuard = TypeGuard<unknown>

export interface IsTypeOfSettings<O extends AnyTypeGuard, T> extends TypeValidatorSettings<T> {

    readonly of: O

}

export abstract class IsTypeOf<O extends AnyTypeGuard, T> extends IsType<T> {

    readonly of: O

    constructor({ of, ...settings }: IsTypeOfSettings<O, T>) {
        super(settings)
        this.of = of
    }
}
