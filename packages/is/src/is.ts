import { 
    ChainableSchemaFactory, 
    ChainableSchemaFactoryGetters 
} from './schema/schemas/chainable-schema'

import { 
    IsBoolean, 
    IsEnum, 
    IsEnumInput, 
    IsInstance, 
    IsInstanceInput, 
    IsNumber, 
    IsString,

    Schema, 
    SchemaFrom

} from './schema'

//// Main ////

class Is extends ChainableSchemaFactory<SchemaFrom> 
    implements ChainableSchemaFactoryGetters {

    constructor() {
        super(Schema.from)
    }

    string = new IsString()

    boolean = new IsBoolean()

    number = new IsNumber()

    enum<T extends IsEnumInput>(
        ...options: T
    ): IsEnum<T> {
        return new IsEnum(...options)
    }

    instanceOf<T extends IsInstanceInput>(
        type: T
    ): IsInstance<T> {
        return new IsInstance(type)
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