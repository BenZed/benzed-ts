import { TypeGuard } from './func'
import { isNil } from './nil'

//// Basic ////

export const isString = (i: unknown): i is string => 
    typeof i === 'string'

export const isNumber =(i: unknown): i is number => 
    typeof i === 'number' && !isNaN(i)

export const isBoolean = (i: unknown): i is boolean =>
    typeof i === 'boolean'

export const isBigInt =(i: unknown): i is bigint => 
    typeof i === 'bigint'

//// Falsy ////

export type Falsy = '' | 0 | null | undefined | false
export const isFalsy = (input: unknown): input is Falsy => !input

//// Truthy ////

export type Truthy = string | number | object | true 
export const isTruthy = (input: unknown): input is Truthy => !!input

//// Primitive ////

export type Primitive = string | number | boolean | bigint | symbol | null | undefined 
export const isPrimitive = (i: unknown): i is Primitive => 
    isBoolean(i) ||
    isString(i) ||
    isNumber(i) ||
    isBigInt(i) ||
    isSymbol(i) ||
    isNil(i)

export const isEqual = <T extends Primitive[]>(...values: T): TypeGuard<T[number]> => 
    (i: unknown): i is T[number] => values.some(value => Object.is(i, value))

//// Symbol ////
    
export const isSymbol = <S extends symbol>(i: unknown): i is S => typeof i === 'symbol'

//// Special ////

const { isInteger, isNaN } = Number
export { isInteger, isNaN }