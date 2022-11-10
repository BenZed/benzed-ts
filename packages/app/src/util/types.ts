import { HttpMethod } from './http-methods'

/**
 * Given two string types, camel case them together if the first isn't empty
 */
export type CamelCombine<P extends string, K extends string> = 
    P extends '' 
        ? K 
        : `${P}${Capitalize<K>}`

/**
 * String starting with a slash, as in a path.
 */
export type Path = `/${string}`

/**
 * Keys on an object that could be used as url parameters
 */
export type UrlParamKeys<T> = keyof {
    [K in keyof T as T[K] extends string | number | undefined | null ? K : never]: never
}

export interface Request {
    method: HttpMethod
    url: Path
    body?: object
    headers?: Headers
}
