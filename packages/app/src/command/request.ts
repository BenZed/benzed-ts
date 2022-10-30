import { equals } from '@benzed/immutable'
import match from '@benzed/match'
import { omit } from "@benzed/util"
import { COMMAND_ENDPOINT } from '../constants'

import { HttpMethod } from "../modules/connection/server/http-methods"

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

/*** Types ***/

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
type Request<T extends object, P extends StringFields<T>> = readonly [
    method: HttpMethod,
    url: `/${string}`,
    data: Omit<T, P>
]

/**
 * Method that converts command data to Request data
 */
type ToRequest<T extends object, P extends StringFields<T>> = (data: T) => Request<T, P>

/**
 * Method that checks a request to see if it has the correct method, url and 
 * data for a command.
 * 
 * If it does, returns the data for that command. If not, returns null.
 */
type FromRequest<T extends object, P extends StringFields<T>> = (request: readonly [
    method: HttpMethod,
    url: string,
    data: object
]) => Omit<T,P> | null

/*** Helper ***/

const toPath = (...words: string[]): `/${string}` => 
    `/${words.join(`/`)}`
        .replace(/\/(\/+)/g, `/`) as `/${string}`

const fromPath = (path: string): string[] => 
    path
        .split(`/`)
        .filter(word => word)

const nameToMethodUrl = (name: string): [HttpMethod, `/${string}`] => {
    const [prefix, ...rest] = name.split(`-`)

    const [method] = match(prefix)
    (`get`, HttpMethod.Get)
    (`find`, HttpMethod.Get)
    (`post`, HttpMethod.Post)
    (`create`, HttpMethod.Post)
    (`put`, HttpMethod.Put)
    (`update`, HttpMethod.Put)
    (`patch`, HttpMethod.Patch)
    (`edit`, HttpMethod.Patch)
    (`delete`, HttpMethod.Delete)
    (`remove`, HttpMethod.Delete)
    (null)

    if (!method)
        return [HttpMethod.Post, COMMAND_ENDPOINT]

    return [method, `/${rest.join(`-`)}`]
}

/*** Main ***/

const createNameToReq = (name: string, param = `id`): ToRequest<any, any> => {
    const [method, url] = nameToMethodUrl(name)
    return method
        ? createToReq(method, url, param)
        : createToReq(HttpMethod.Post, `/command`)
}

const createToReq = <D extends object, P extends StringFields<D> = never>(
    method: HttpMethod, 
    url: `/${string}`, 
    urlParam?: P
): ToRequest<D, P> => 
    (data: any): Request<D, P> => {

        if (urlParam && urlParam in data) {
            return [
                method,
                toPath(url, data[urlParam]),
                omit(data, urlParam) as any
            ]
        }

        return [ method, url, data ]
    }

const createNameFromReq = (name: string, param = `id`): FromRequest<any,any> => {
    const [method, url] = nameToMethodUrl(name)
    return method
        ? createFromReq(method, url, param)
        : createFromReq(HttpMethod.Post, `/command`)
}

const createFromReq = <D extends object, P extends StringFields<D> = never>(
    method: HttpMethod, 
    url: `/${string}`, 
    paramKey?: P
): FromRequest<D, P> => {
    
    const toReq = createToReq(method, url, paramKey as never)
    
    return ([ rMethod, rUrl, rData ]): D | null => {

        const [ matchMethod, matchUrl ] = toReq(rData)
        if (rMethod !== matchMethod)
            return null

        const keys = fromPath(rUrl)
        const matchKeys = fromPath(matchUrl)

        const paramValue = keys.length === matchKeys.length + 1 
            ? keys.pop()
            : null 

        if (!equals(keys, matchKeys)) 
            return null 

        const outputData = paramValue && paramKey ? { ...rData, [paramKey]: paramValue } : rData
        return outputData as D | null
    }
}

/*** Exports ***/
    
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