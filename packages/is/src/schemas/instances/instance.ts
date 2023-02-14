import { $$settings, InstanceValidator, InstanceValidatorInput, Schema } from '@benzed/schema'
import { pick } from '@benzed/util'
import { TypeCast, TypeDefault } from '../../validators'

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

interface Instance <T extends InstanceValidatorInput> extends Schema<ConfigurableInstanceValidator<T>, {}> {
    default(def: TypeDefault): this
    cast(caster: TypeCast): this
}

const Instance = class Instance <T extends InstanceValidatorInput> extends Schema<ConfigurableInstanceValidator<T>, {}> {

    constructor(Type: T) {
        super(new ConfigurableInstanceValidator(Type), {})
    }

} as new <T extends InstanceValidatorInput>(Type: T) => Instance<T>

//// Exports ////

export {
    Instance
}