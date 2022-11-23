import { Schema } from './schema'

//// Helper ////

// eslint-disable-next-line
type Asserts<T> = T extends Schema<any,any,any> 
    ? T['assert']
    : (input: unknown) => asserts input is T

//// Export ////

export * from './schema'
export { default } from './schema'

export * from './schema/flags'
export * from './util/validation-error'

export {
    Asserts
}