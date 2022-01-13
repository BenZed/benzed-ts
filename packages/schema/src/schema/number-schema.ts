
import { PrimitiveSchema } from './schema'

/*** Main ***/

class NumberSchema<T extends number = number> extends PrimitiveSchema<T> {

}

/*** Export ***/

export default NumberSchema

export {
    NumberSchema
}