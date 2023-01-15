import { Is } from './is'

//// Default ////

const is = new Is

//// Exports ////

export default is

export {
    is,
    Is
}

export { TypeOf as InferType, TypesOf as InferTypes } from '@benzed/util'  
export * from './schema'
export * from './validator' 