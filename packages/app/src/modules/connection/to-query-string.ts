import is from '@benzed/is'

//// toQueryString ////

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

//// Export ////

export default toQueryString

export {
    toQueryString
}