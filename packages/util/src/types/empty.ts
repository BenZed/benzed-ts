import { namesOf, symbolsOf } from '../types'
import { isRecord } from './guards'

/**
 * Object with no properties
 */
export type Empty = { [key: string]: never }

export const isEmpty = (input: unknown): input is Empty => 
    isRecord(input) && 
    namesOf.count(input) === 0 && 
    symbolsOf.count(input) === 0