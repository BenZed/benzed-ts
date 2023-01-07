import { Callable } from '@benzed/util'
import Schema from '../schema/schema'
import BooleanSchema from './boolean'

////  ////

// Move me
class SchemaFactory extends Callable<() => Schema<unknown>> {

}

//// Main ////

class OrSchemaFactory extends SchemaFactory {

    get boolean(): BooleanSchema {
        return new BooleanSchema()
    }
    
}

//// Exports ////

export default OrSchemaFactory

export {
    OrSchemaFactory
}