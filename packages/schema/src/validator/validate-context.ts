import { Struct } from '@benzed/immutable'
import { assign, merge, omit } from '@benzed/util'

import { ValidateOptions } from './validate'

//// Main ////

class ValidateContext<I> extends Struct implements ValidateOptions {

    readonly transform!: boolean
    readonly path: readonly (string | symbol | number)[] = []
    readonly input!: I

    constructor(public value: I, options?: Partial<ValidateOptions>) {
        super()

        if (options instanceof ValidateContext)
            assign(this, omit(options, 'value'))
        else {
            this.transform = options?.transform ?? true
            this.input = value
        }
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