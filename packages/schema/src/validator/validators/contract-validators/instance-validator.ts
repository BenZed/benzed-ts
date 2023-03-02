import { assign } from '@benzed/util'
import { Validator } from '../../validator'
import TypeValidator from './type-validator'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Types ////

type InstanceValidatorInput = 
    (new (...args: any) => object) |
    (abstract new (...args: any) => object)

//// Main ////

class InstanceValidator<T extends InstanceValidatorInput> extends TypeValidator<InstanceType<T>> {

    constructor(readonly Type: T) {
        super()
    }

    override get name(): string {
        return this.Type.name
    }

    isValid(value: unknown): value is InstanceType<T> {
        return value instanceof this.Type
    }

    [Validator.copy]() {
        const clone = super[Validator.copy]()
        assign(clone, { Type: this.Type })
        return clone 
    }

}

//// Exports ////

export default InstanceValidator

export {
    InstanceValidator,
    InstanceValidatorInput
}