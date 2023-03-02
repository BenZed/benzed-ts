import { ValidateOutput, Validator } from '@benzed/schema'
import { Callable, Mutate, Trait } from '@benzed/traits'
import { TypeGuard } from '@benzed/util'

//// Types ////

export type Is<V extends Validator> =
    TypeGuard<ValidateOutput<V>>

export interface IsConstructor {
    new <V extends Validator>(validator: V): Is<V>
}

//// Implementation ////

export const Is = class Is extends Trait.use(Mutate, Callable) {

    //

} as IsConstructor