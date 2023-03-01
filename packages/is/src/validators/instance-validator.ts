import { Structural } from '@benzed/immutable'
import { 
    InstanceValidatorInput, 
    InstanceValidator as StatelessInstanceValidator, 
} from '@benzed/schema'

import { pick } from '@benzed/util'

import { SettingsValidator } from '.'

//// Validator ////

export class InstanceValidator <T extends InstanceValidatorInput> 
    extends StatelessInstanceValidator<T> 
    implements SettingsValidator<unknown> {

    override name: string

    constructor(Type: T) {
        super(Type)
        this.name = Type.name
    }

    //// Settings ////
    
    get [Structural.state](): Pick<this, 'name' | 'message' | 'default' | 'cast'> {
        return pick(this, 'name', 'message', 'default', 'cast', 'Type')
    }

}

export {
    InstanceValidatorInput
}