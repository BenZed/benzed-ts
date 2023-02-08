import { $$settings, InstanceValidator, InstanceValidatorInput, Schema } from '@benzed/schema'
import { assign, pick } from '@benzed/util'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Validator ////

class InstanceOf <T extends InstanceValidatorInput> extends InstanceValidator<T> {

    get [$$settings](): Pick<this, 'name' | 'message'> {
        return pick(this, 'name', 'message', 'Type')
    }

    constructor(Type: T) {
        super(Type)
        assign(this, { name: Type.name })
    }

}

//// Schema ////

class Instance <T extends InstanceValidatorInput> extends Schema<InstanceOf<T>, {}> {

    constructor(Type: T) {
        super(new InstanceOf(Type), {})
    }

}

//// Exports ////

export {
    Instance
}