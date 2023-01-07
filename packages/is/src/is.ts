import { ChainableSchemaFactory, ChainableSchemaFactoryInterface } from './schema/schemas/chainable-schema'

import { 
    IsBoolean, 
    IsEnum, 
    IsEnumInput, 
    IsNumber, 
    IsString,

    Schema, 
    SchemaFrom

} from './schema'

//// Main ////

class Is extends ChainableSchemaFactory<SchemaFrom> 
    implements ChainableSchemaFactoryInterface {

    constructor() {
        super(Schema.from)
    }

    string = new IsString()

    boolean = new IsBoolean()

    number = new IsNumber()

    enum<E extends IsEnumInput>(
        ...options: E
    ): IsEnum<E> {
        return new IsEnum(...options)
    }

}

//// Default ////

const is = new Is()

//// Exports ////

export default Is

export {
    Is,
    is
}