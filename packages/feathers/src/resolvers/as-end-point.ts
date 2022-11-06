
import { toEndPoint } from '../util'
import { StringKeys } from '../types'

/**
 * Convert this field to an endpoint
 */
export const asEndPoint = <T, F extends StringKeys<T>>(field: F) => (
    
    _: string | undefined,
    
    record: T

): Promise<string | undefined> =>
    Promise.resolve(
        record[field] && toEndPoint(`${record[field]}`)
    )
