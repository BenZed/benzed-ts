import is from '@benzed/is'
import { isEmpty, nil } from '@benzed/util/lib'

//// QueryString ////

/**
 * Convert an object to a query string
 * @param data 
 * @param prefix
 * @returns stringified query
 */
function toQueryString(data: object, prefix = ''): string {

    const queryStrings: string[] = []
 
    for (const key in data) {

        if (data.hasOwnProperty(key)) {

            const value = data[key as keyof object]

            const keyWithPrefix = prefix ? `${prefix}[${key}]` : key

            const queryString = is.object(value)
                ? toQueryString(value, keyWithPrefix) 
                : encodeURIComponent(keyWithPrefix) + '=' + encodeURIComponent(value)

            queryStrings.push(queryString)
        }
    }

    const queryString = queryStrings.join('&')
    return queryString && !prefix ? `?${queryString}` : queryString
}

function fromQueryString(queryString: string | nil): object | nil {

    const query: Record<string, unknown> = {}

    if (!queryString) 
        return nil

    const segments = queryString.split('&')
    for (const segment of segments) {
        
        const [ key, value ] = segment.split('=')
        if (key.length === 0) 
            continue

        if (!(key in query)) 
            query[key] = value

        else if (is.array(query[key])) 
            (query[key] as unknown[]).push(value)

        else 
            query[key] = [query[key], value] 
    }

    return isEmpty(query) ? nil : query
}

//// Export ////

export {
    toQueryString,
    fromQueryString
}