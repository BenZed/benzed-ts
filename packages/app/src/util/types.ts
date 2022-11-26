import $, { Schema } from '@benzed/schema'

import { HttpMethod } from './http-methods'
import { Headers } from 'cross-fetch'

/**
 * String starting with a slash, as in a path.
 */
export type Path = `/${string}`

/**
 * Remove the starting slash from a string, unpathing it.
 */
export type UnPath<S extends string> = S extends `/${infer Sx}` ? Sx : S

/**
 * Schema for path
 */
export const $path = Object.assign($.string
    .trim()
    .validates(
        s => s.startsWith('/') ? s : `/${s}`, 
    
        'Must start with a "/"'
    )
    .validates(
        s => s.replace(/\/+/g, '/'), 
    
        'Must not have multiple consecutive "/"s'
    ) 
    .validates(
        s => s.replace(/\/$/, '') || '/',
        //                                                      ^ in case we just removed the last slash
        'Must not end with a "/"'
    ) as Schema<Path, Path>, {
    
})

/**
 * usable url param values
 */
export type UrlParam = string | number | undefined
 
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

export {
    Headers
}