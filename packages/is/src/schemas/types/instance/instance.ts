
import { InstanceValidator, InstanceValidatorInput, TypeSchema } from '@benzed/schema'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Schema ////

class Instance <T extends InstanceValidatorInput> extends TypeSchema<InstanceValidator<T>, {}> {

    constructor(Type: T) {
        super(new InstanceValidator(Type), {})
    }

}

//// Exports ////

export {
    Instance
}