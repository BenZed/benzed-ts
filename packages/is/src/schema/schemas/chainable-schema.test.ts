import BooleanSchema from './boolean'
import OrSchemata from './or'

it ('SchemaChain', () => {

    const booleanOr = new OrSchemata(new BooleanSchema())

    const isBooleanOrString = booleanOr.string.or.number

})