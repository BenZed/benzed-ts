import { IsBoolean } from './is-type'

import Or from './or'

it ('SchemaChain', () => {

    const booleanOr = new OrSchemata(new IsBoolean())

    const isBooleanOrString = booleanOr.string.or.number

})