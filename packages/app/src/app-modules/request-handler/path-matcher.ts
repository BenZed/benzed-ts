import { JsonObject as Json, memoize, nil } from '@benzed/util'

import { $path, path, UrlParamKeys } from '../../util'

//// Types ////

/**
 * Given a path, an unpather will return any data pulled from the url, or
 * nil if the url was a non-match.
 * 
 * @param url Incoming url without query
 * @param data Data constructed from the request so far.
 */
export type PathMatcher<T extends Json> = (url: path, data: Partial<T>) => T | Partial<T> | nil

//// Main ////

/**
 * Creates a pather that matches an exact url
 */
export const createStaticPathMatcher: <T extends Json>(path: path) => PathMatcher<T> = 
    memoize(path => (url, data) => path === $path.validate(url) ? data : nil, 'createStaticPathMatcher')

/**
 * Create a pather from a template string that's interpolated by object keys.
 * The unpather will 
 */
export const createUrlParamPathMatcher = <T extends Json>(
    urlSegments: readonly string[], 
    ...urlParamKeys: UrlParamKeys<T>[]
): PathMatcher<T> => {

    // no 0 length segments unless it's the final segment, otherwise it wont
    // be possible to differentiate params from one another.
    if (urlSegments.some((seg, i) => seg.length === 0 && i !== urlSegments.length - 1))
        throw new Error('Params must be seperated by at least one character.')

    return (url: path, input: Partial<T>) => {

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
            if (urlParamKey && urlParamValue)
                output[urlParamKey] = urlParamValue as T[UrlParamKeys<T>]
        }

        // may have found output and data, but match is incomplete
        if (remainingUrl && remainingUrl !== '/')
            return nil

        return output
    }
}
