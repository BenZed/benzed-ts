import { PrimitiveSchema } from './schema'

/*** Main ***/

class BooleanSchema<T extends boolean = boolean> extends PrimitiveSchema<T> {

}

/*** Export ***/

export default BooleanSchema

export {
    BooleanSchema
}