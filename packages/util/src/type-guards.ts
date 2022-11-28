import { Func } from './types'

//// These are here instead of `is` to resolve conflicting dependencies ////

export const isString = <S extends string = string>(i: unknown): i is S => typeof i === 'string'

export const isNumber = <N extends number = number>(i: unknown): i is N => typeof i === 'number' && !Number.isNaN(i)

export const isBoolean = <B extends boolean = boolean>(i: unknown): i is B => typeof i === 'boolean'

export const isFunction = <F extends Func = Func>(i: unknown): i is F => typeof i === 'function'

export const isObject = <T extends object = object>(i: unknown): i is T => typeof i === 'object' && i !== null

export const isArrayLike = <T = unknown>(i: unknown): i is ArrayLike<T> => 
    isString(i) || isObject<{ length?: unknown }>(i) && typeof i.length === 'number'

export const isArray = <T = unknown>(i: unknown): i is T[] => 
    Array.isArray(i)

export const isInteger = (i: unknown): i is number => Number.isInteger(i)
