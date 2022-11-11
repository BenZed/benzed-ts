import $, { Schema } from '@benzed/schema'
import { nil } from '@benzed/util'

import { HttpMethod } from './http-methods'

/**
 * String starting with a slash, as in a path.
 */
export type Path = `/${string}`

/**
 * Schema for path
 */
export const $path = $.string
    .validates(s => s.startsWith('/') ? s : '/' + s, 'Must start with a "/"')
    .validates(s => s.replace(/\/\/+/gi, '/'), 'Must not have multiple consecutive "/"s') as Schema<Path, Path>

/**
 * usable url param values
 */
export type UrlParam = string | number | nil
 
/**
 * Subset object containing only values that are applicable url params
 */
export type UrlParams<T> = {
    [K in keyof T as T[K] extends UrlParam ? K : never]: T[K]
}

/**
 * Keys on an object that could be used as url parameters
 */
export type UrlParamKeys<T> = keyof UrlParams<T>

/**
 * 
 */
export interface Request {
    method: HttpMethod
    url: Path
    body?: object
    headers?: Headers
}
