
import { HttpMethod } from './http-methods'
import { Headers } from 'cross-fetch'

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
    url: string
    body?: object
    headers?: Headers
}

export {
    Headers
}