import { $$settings, InstanceValidator, InstanceValidatorInput, Schema } from '@benzed/schema'
import { pick } from '@benzed/util'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Validator ////

class ConfigurableInstanceValidator <T extends InstanceValidatorInput> extends InstanceValidator<T> {

    get [$$settings](): Pick<this, 'name' | 'message'> {
        return pick(this, 'name', 'message', 'Type')
    }

    override name: string

    constructor(Type: T) {
        super(Type)
        this.name = Type.name
    }

}

//// Schema ////

class Instance <T extends InstanceValidatorInput> extends Schema<ConfigurableInstanceValidator<T>, {}> {

    constructor(Type: T) {
        super(new ConfigurableInstanceValidator(Type), {})
    }

}

//// Exports ////

export {
    Instance
}