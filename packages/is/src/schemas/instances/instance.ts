import { InstanceValidatorInput } from '@benzed/schema'

import { InstanceValidator } from '../../validators'

import { TypeSchema } from '../type'

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