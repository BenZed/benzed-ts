import { numKeys } from '../methods'
import { isObject } from './guards'

/**
 * Object with no properties
 */
export type Empty = { [key: string]: never }

export const isEmpty = (input: unknown): input is Empty => isObject(input) && numKeys(input) === 0