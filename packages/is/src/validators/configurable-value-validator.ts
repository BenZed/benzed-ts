import { $$settings, ValueValidator } from '@benzed/schema'
import { pick, Primitive } from '@benzed/util'

//// Exports ////

export class ConfigurableValueValidator <T extends Primitive> extends ValueValidator<T> {

    override readonly name: string

    get [$$settings](): Pick<this, 'name' | 'message' | 'force'> {
        return pick(this, 'name', 'message', 'force', 'value')
    }

    constructor(value: T, force: boolean) {
        super(value, force)
        this.name = String(value)
    }

}
