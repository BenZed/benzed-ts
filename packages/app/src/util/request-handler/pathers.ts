
import { memoize } from '@benzed/util'
import is from '@benzed/is'

import { Path, UrlParamKeys } from '../types'

//// Types ////

/**
 * Given data, a pather will return a path and subset
 * data containing fields that were not used in the 
 * query or url parameters when constructing the path.
 * 
 * If no object is returned, then no data was used.
 */
export type Pather<T> = (data: T) => [Path, Partial<T>] | [Path]

//// Canned Pathers ////
 
/**
  * Creates a pather that simply returns the given path
  */
export const createStaticPather = memoize((path: Path): Pather<unknown> => () => [path])
 
/**
  * Create a pather from a template string that's interpolated by a
  * series of object keys, where the values are converted into url
  * params
  */
export const createUrlParamPather = <T>(strings: readonly string[], ...urlParams: UrlParamKeys<T>[]): Pather<T> => (data: T) => {
 
    const dataWithoutUrlParams = {...data}
    let url = ''
    for (let i = 0; i < urlParams.length; i++) {
        const key = urlParams[i] as keyof T
        const value = data[key] as string | number | undefined
        delete dataWithoutUrlParams[key]
 
        url = strings[i] + (is.number(value) || value ? `${url}${value}` : url) 
    }
    const urlWithoutMultiSlashes = url.replace(/\/+/gi, '/') as Path
 
    return [urlWithoutMultiSlashes, dataWithoutUrlParams]
}
 