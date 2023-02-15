import { $$settings, ValueValidator as StatelessValueValidator } from '@benzed/schema'
import { pick, Primitive } from '@benzed/util'
import { SettingsValidator } from '.'

//// Exports ////

export class ValueValidator <T extends Primitive> extends StatelessValueValidator<T> implements SettingsValidator<unknown, T> {

    override readonly name: string

    //// Construct ////

    constructor(value: T, force: boolean) {
        super(value, force)
        this.name = String(value)
    }

    //// Settings ////
    
    get [$$settings](): Pick<this, 'name' | 'message' | 'force'> {
        return pick(this, 'name', 'message', 'force', 'value')
    }

}
