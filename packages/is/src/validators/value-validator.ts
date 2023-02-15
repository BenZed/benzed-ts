import { $$settings, ValueValidator as StatelessValueValidator } from '@benzed/schema'
import { pick, Primitive } from '@benzed/util'

//// Exports ////

export class ValueValidator <T extends Primitive> extends StatelessValueValidator<T> {

    override readonly name: string

    get [$$settings](): Pick<this, 'name' | 'message' | 'force'> {
        return pick(this, 'name', 'message', 'force', 'value')
    }

    constructor(value: T, force: boolean) {
        super(value, force)
        this.name = String(value)
    }

}
