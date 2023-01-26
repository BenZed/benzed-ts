
import { Validate } from '../validator/validate'

import { 
    SchemaConstructor, 
    SchemaProperties, 
    SchemaSetters, 
    SchemaSettingsInput 
} from './schema-types-v2'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Type ////

type AnySchema = Schema<any,any,SchemaSettingsInput<any>> 

type Schema<I, O, T extends SchemaSettingsInput<O>> = 
    SchemaProperties<I, O, T> & 
    SchemaSetters<I,O,T>

//// Implementation ////

const Schema = class extends Validate<unknown, unknown> {

} as SchemaConstructor

//// Exports ////

export default Schema 

export { Schema, AnySchema } 