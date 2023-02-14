import { $$settings, ShapeValidator } from '@benzed/schema'
import { pick } from '@benzed/util'
import { ShapeInput } from '../schemas/shape'

//// Exports ////

export class ConfigurableShapeValidator<T extends ShapeInput> extends ShapeValidator<T> {

    get [$$settings](): Pick<this, 'default' | 'properties' | 'name'> {
        return pick(this, 'name', 'default', 'properties')
    }

}