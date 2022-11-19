import { memoize, nil } from '@benzed/util'

import { $path, Path, UrlParamKeys } from '../../util/types'

//// Types ////

/**
 * Given a path, an unpather will return any data pulled from the url, or
 * nil if the url was a non-match.
 * 
 * @param url Incoming url without query
 * @param data Data constructed from the request so far.
 */
export type Unpather<T extends object> = (url: Path, data: Partial<T>) => T | Partial<T> | nil

/**
 * Creates a pather that matches an exact url
 */
export const createStaticUnpather: <T extends object>(path: Path) => Unpather<T> = 
    memoize(path => (url, data) => path === $path.validate(url) ? data : nil)

/**
 * Create a pather from a template string that's interpolated by object keys.
 * The unpather will 
 */
export const createUrlParamUnpather = <T extends object>(
    urlSegments: readonly string[], 
    ...urlParamKeys: UrlParamKeys<T>[]
): Unpather<T> => (url: Path, input: Partial<T>) => {

    let remainingUrl: string = $path.validate(url)
    const splitRemainingUrl = (index: number): string => {
        const segment = remainingUrl.substring(0, index)
        remainingUrl = remainingUrl.substring(index)
        return segment
    }

    const output = { ...input }
    
    for (let i = 0; i < urlSegments.length; i++) {
        const urlSegment = urlSegments[i]
        const urlParamKey = urlParamKeys.at(i)

        const urlMatchSegment = splitRemainingUrl(urlSegment.length)
        if (urlMatchSegment !== urlSegment && urlMatchSegment + '/' !== urlSegment)
            return nil

        const nextUrlSegment = urlSegments[i + 1] || '/'
        const urlValueEndIndex = nextUrlSegment && remainingUrl.includes(nextUrlSegment)
            ? remainingUrl.indexOf(nextUrlSegment)
            : remainingUrl.length

        const urlParamValue = splitRemainingUrl(urlValueEndIndex)
        if (urlParamKey)
            output[urlParamKey] = urlParamValue as T[UrlParamKeys<T>]
    }

    // may have found output and data, match is incomplete
    if (remainingUrl && remainingUrl !== '/')
        return nil

    return output
}
