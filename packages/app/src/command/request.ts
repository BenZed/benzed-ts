import { equals } from '@benzed/immutable/lib'
import match from '@benzed/match'
import { omit, StringKeys } from "@benzed/util"
import { COMMAND_ENDPOINT } from '../constants'

import { HttpMethod } from "../modules/connection/server/http-methods"

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

/*** Types ***/

type Request<T extends object> = readonly [
    method: HttpMethod,
    url: string,
    data: T
]

type ToRequest<T extends object> = (data: T) => Request<T>

type FromRequest<T extends object> = (request: Request<T>) => T | null

/*** Helper ***/

const toPath = (...words: string[]): `/${string}` => 
    `/${words.join(`/`)}`
        .replace(/\/(\/+)/g, `/`) as `/${string}`

const fromPath = (path: string): string[] => 
    path
        .split(`/`)
        .filter(word => word)

/*** Main ***/

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

const createNameToReq = (name: string): ToRequest<any> => {
    const [method, url] = nameToMethodUrl(name)
    return method
        ? createToReq(method, url, `id`)
        : createToReq(HttpMethod.Post, `/command`)
}

const createToReq = <D extends object>(method: HttpMethod, url: `/${string}`, urlParam?: StringKeys<D>): ToRequest<D> => 
    (data: D): Request<D> => {

        if (urlParam && urlParam in data) {
            return [
                method,
                toPath(url, (data as any)[urlParam]),
                omit(data, urlParam) as any
            ]
        }

        return [ method, url, data ]
    }

const createNameFromReq = (name: string): FromRequest<any> => {
    const [method, url] = nameToMethodUrl(name)
    return method
        ? createFromReq(method, url, `id`)
        : createFromReq(HttpMethod.Post, `/command`)
}

const createFromReq = <D extends object>(method: HttpMethod, url: `/${string}`, paramKey?: StringKeys<D>): FromRequest<D> => {
    
    const toReq = createToReq(method, url, paramKey)
    
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
        return outputData
    }
}

/*** Exports ***/
    
export {
    Request,
    ToRequest,
    FromRequest,

    createToReq,
    createFromReq,
    createNameToReq,
    createNameFromReq
}