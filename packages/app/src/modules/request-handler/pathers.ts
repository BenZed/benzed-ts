import is from '@benzed/is'
import { memoize, omit } from '@benzed/util'

import { Path, $path, UrlParamKeys } from '../../util/types'

//// Types ////

/**
 * Given data, a pather will return a path and subset
 * data containing fields that were not used in the 
 * query or url parameters when constructing the path.
 * 
 * If no data was used, data object will be returned without changes.
 */
export type Pather<T extends object> = 
    (data: T) => [ url: Path, dataWithoutUrlParams: T | Partial<T> ]

/**
  * Creates a pather that simply returns the given path
  */
export const createStaticPather: <T extends object>(path: Path) => Pather<T> = 
    memoize(path => data => [ path, data ])

/**
  * Create a pather from a template string that's interpolated by object keys.
  * The pather will return a url with params that are matched to given key values.
  */
export const createUrlParamPather = <T extends object>(
    urlSegments: readonly string[], 
    ...urlParamKeys: UrlParamKeys<T>[]
): Pather<T> => (data: T) => {
    
    let url = ''
    for (let i = 0; i < urlSegments.length; i++) {

        url += urlSegments[i]

        const urlParamKey = urlParamKeys[i] as UrlParamKeys<T>
        const urlParamValue = data[urlParamKey]

        // 0 is a an acceptable url param value, but '' or nil are not
        if (is.number(urlParamValue) || urlParamValue)
            url += urlParamValue
    }

    return [
        $path.validate(url), 
        omit(data, ...urlParamKeys) as Partial<T>
    ]
}
