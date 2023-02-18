import { each } from '../each'
import { isRecord } from './guards'

/**
 * Object with no properties
 */
export type Empty = { [key: string]: never }

export const isEmpty = (input: unknown): input is Empty => 
    isRecord(input) && 
    each.keyOf(input).count === 0 