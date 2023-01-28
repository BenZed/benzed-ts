import { Empty } from './empty'

const $$invalid = Symbol('invalid-type-error')

export type Invalid<msg = 'This is an invalid type.'> = { readonly [$$invalid]: msg } & Empty
