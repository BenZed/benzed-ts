import { Mutable } from '@benzed/util/src'
import { Validate } from '../../../validator'
import IsType from './is-type'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

export type IsInstanceInput = 
    (new (...args: any) => object) | 
    (abstract new (...args: any) => object)

//// Exports ////

class IsInstance<C extends IsInstanceInput> 
    extends IsType<InstanceType<C>> {

    constructor(readonly Type: C) {
        super({
            type: Type.name,
            is: (i): i is InstanceType<C> => 
                i instanceof Type
        })
    }

    protected override _copyWithValidators(...validators: Validate<unknown, unknown>[]): this {
        const clone = super._copyWithValidators(...validators);
        (clone as Mutable<{ Type: C }>).Type = this.Type
        return clone
    }

}

//// Exports ////

export default IsInstance

export {
    IsInstance
}