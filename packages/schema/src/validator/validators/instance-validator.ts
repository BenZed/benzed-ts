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

    readonly name: string

    constructor(readonly Type: T) {
        super()
        this.name = Type.name
    }

    isValid(value: unknown): value is InstanceType<T> {
        return value instanceof this.Type
    }

}

//// Exports ////

export default InstanceValidator

export {
    InstanceValidator,
    InstanceValidatorInput
}