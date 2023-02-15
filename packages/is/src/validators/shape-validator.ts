import {

    $$settings,

    ShapeValidatorInput as ShapeInput,

    ShapeValidatorOutput as ShapeOutput,

    ShapeValidator as StatelessShapeValidator,

} from '@benzed/schema'

import { pick } from '@benzed/util'
import { SettingsValidator } from '.'

//// Exports ////

export class ShapeValidator<T extends ShapeInput> extends StatelessShapeValidator<T> implements SettingsValidator<T> {

    get [$$settings](): Pick<this, 'default' | 'properties' | 'name' | 'message'> {
        return pick(this, 'name', 'default', 'properties', 'message')
    }

}

export {
    ShapeInput,
    ShapeOutput
}

