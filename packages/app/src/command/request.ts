import match from '@benzed/match'
import { omit } from '@benzed/util'
import { equals } from '@benzed/immutable'

import { Path } from '../util/types'
import { HttpMethod } from '../util'
import { COMMAND_ENDPOINT } from '../constants'

//// Eslint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

/**
 * Keys on an object that have string as a value
 */
type StringFields<T extends object> = keyof {
    [K in keyof T as T[K] extends string ? K : never]: T[K]
}

/**
 * Where T is command data, and P is a list of keys of that data
 * that will be serialized into the url
 */
type Request<T extends object, P extends StringFields<T> = any> = readonly [
    method: HttpMethod,
    url: Path,
    data: Omit<T, P>,
    headers: Headers | null
] 
/**
 * Method that converts command data to Request data
 */
type ToRequest<T extends object, P extends StringFields<T> = any> = (data: T) => Request<T, P>

/**
 * Method that checks a request to see if it has the correct method, url and 
 * data for a command.
 * 
 * If it does, returns the data for that command. If not, returns null.
 */
type FromRequest<T extends object, P extends StringFields<T>> = (request: Request<object>) => Omit<T,P> | null

//// Helper ////

const toPath = (...words: string[]): Path => 
    `/${words.join('/')}`
        .replace(/\/(\/+)/g, '/') as Path

const fromPath = (path: string): string[] => 
    path
        .split('/')
        .filter(word => word)

const nameToMethodUrl = (name: string): [HttpMethod, Path] => {
    const [prefix, ...rest] = name.split('-')

    const [method] = match(prefix)
        .case('get', HttpMethod.Get)
        .case('find', HttpMethod.Get)
        .case('post', HttpMethod.Post)
        .case('create', HttpMethod.Post)
        .case ('put', HttpMethod.Put)
        .case ('update', HttpMethod.Put)
        .case('patch', HttpMethod.Patch)
        .case('edit', HttpMethod.Patch)
        .case('delete', HttpMethod.Delete)
        .case('remove', HttpMethod.Delete)
        .default(null)

    if (!method)
        return [HttpMethod.Post, COMMAND_ENDPOINT]

    return [method, `/${rest.join('-')}`]
}

//// Main ////

const createNameToReq = (name: string, param = 'id'): ToRequest<any, any> => {
    const [method, url] = nameToMethodUrl(name)
    return method
        ? createToReq(method, url, param)
        : createToReq(HttpMethod.Post, COMMAND_ENDPOINT)
}

const createToReq = <D extends object, P extends StringFields<D> = never>(
    method: HttpMethod, 
    url: Path, 
    urlParam?: P
): ToRequest<D, P> => 
    (data: any): Request<D, P> => {

        if (urlParam && urlParam in data) {
            return [
                method,
                toPath(url, data[urlParam]),
                omit(data, urlParam) as any,
                null
            ]
        }

        return [ method, url, data, null ]
    }

const createNameFromReq = (name: string, param = 'id'): FromRequest<any,any> => {
    const [method, url] = nameToMethodUrl(name)
    return method
        ? createFromReq(method, url, param)
        : createFromReq(HttpMethod.Post, COMMAND_ENDPOINT)
}

const createFromReq = <D extends object, P extends StringFields<D> = never>(
    method: HttpMethod, 
    url: Path, 
    paramKey?: P
): FromRequest<D, P> => {
    
    const toReq = createToReq(method, url, paramKey as never)
    
    return ([ rMethod, rUrl, rData ]): D | null => {

        const [ matchMethod, matchUrl ] = toReq(rData)
        if (rMethod !== matchMethod)
            return null

        const fromSegments = fromPath(rUrl)
        const matchSegments = fromPath(matchUrl)

        const paramValue = paramKey && fromSegments.length === matchSegments.length + 1 
            ? fromSegments.pop()
            : null 

        if (!equals(fromSegments, matchSegments)) 
            return null 

        const outputData = paramValue && paramKey ? { ...rData, [paramKey]: paramValue } : rData
        return outputData as D | null
    }
}

//// Exports ////
    
export {

    Request,
    ToRequest,
    FromRequest,
    StringFields,

    createToReq,
    createFromReq,
    createNameToReq,
    createNameFromReq

}