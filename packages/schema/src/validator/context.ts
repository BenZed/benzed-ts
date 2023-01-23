import { ValidateOptions } from './validate'

//// Main ////

class ValidateContext<I> implements ValidateOptions {

    readonly transform: boolean

    transformed?: I

    constructor(readonly input: I, options?: ValidateOptions) {
        this.transform = options?.transform ?? true
    }

    applyTransform(input: I, options: ValidateOptions): void {

    }

}

//// Exports ////

export default ValidateContext

export {
    ValidateContext
}