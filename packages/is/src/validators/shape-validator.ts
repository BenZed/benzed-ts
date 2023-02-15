import { $$settings, 
    ShapeValidatorInput as ShapeInput, 
    ShapeValidatorOutput as ShapeOutput,
    ShapeValidator as StatelessShapeValidator } from '@benzed/schema'
    
import { pick } from '@benzed/util'

//// Exports ////

export class ShapeValidator<T extends ShapeInput> extends StatelessShapeValidator<T> {

    get [$$settings](): Pick<this, 'default' | 'properties' | 'name'> {
        return pick(this, 'name', 'default', 'properties')
    }

}

export {
    ShapeInput,
    ShapeOutput
}