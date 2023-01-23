import { Struct } from '@benzed/immutable'
import { merge } from '@benzed/util'
import { ValidateOptions } from './validate'

//// Main ////

class ValidateContext<I> extends Struct implements ValidateOptions {

    readonly transform: boolean
    readonly path: readonly (string | symbol | number)[] = []

    transformed?: I

    constructor(readonly input: I, options?: Partial<ValidateOptions>) {
        super()
        this.transform = options?.transform ?? true
    }

    push(item: string | symbol | number): this {
        const ctx = this.copy()
        merge(ctx, { path: [...this.path, item ]})
        return ctx
    }

}

//// Exports ////

export default ValidateContext

export {
    ValidateContext
}