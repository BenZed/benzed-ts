import { PrimitiveSchema } from './schema'

/*** Main ***/

class StringSchema<T extends string = string> extends PrimitiveSchema<T> {

}

/*** Export ***/

export default StringSchema

export {
    StringSchema
}