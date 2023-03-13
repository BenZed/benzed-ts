
import { 
    InstanceValidator, 
    InstanceValidatorInput, 
    TypeSchema,
} from '@benzed/schema'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Schema ////

type ConstructorOf<T extends object> = 
    (new (...args: any) => T) | 
    (abstract new (...args: any) => T)

class InstanceOf <T extends object> extends TypeSchema<InstanceValidator<ConstructorOf<T>>, {}> {
    constructor(Type: ConstructorOf<T>) {
        super(new InstanceValidator(Type), {})
    }
}

//// Exports ////

export {
    InstanceOf,
    InstanceValidatorInput as InstanceInput
}