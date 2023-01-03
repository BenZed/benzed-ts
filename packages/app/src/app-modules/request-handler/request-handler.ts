import { isEmpty, nil, KeysOf, isFunc, isString, JsonObject as Json, isJson } from '@benzed/util'
import { Schematic } from '@benzed/schema'
import { Module } from '@benzed/ecs'

import {
    createStaticPather,
    createUrlParamPather,
    Pather 
} from './pather'

import {
    createStaticPathMatcher,
    createUrlParamPathMatcher,
    PathMatcher
} from './path-matcher'

import {
    Request,
    HttpMethod,
    UrlParamKeys,
    SchemaHook,
    toSchematic,
    $path,
    path,
} from '../../util'

import {
    parse as fromQueryString,
    stringify as toQueryString
} from 'query-string'

//// Eslint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Types ////

type Headerer<T extends Json> = (headers: Headers, data: Partial<T>) => Partial<T>

type HeaderMatch<T extends Json> = (headers: Headers, data: Partial<T>) => Partial<T> | nil

/**
 * Keys that can be used to store/retreive query object.
 */
type QueryKey<T extends Json> = keyof {
    [K in KeysOf<T> as T[K] extends Json | nil ? K : never]: K
}

type RequestHandlerSettings<T extends Json> = {
    method: HttpMethod
    path: {
        to: Pather<T>
        match: PathMatcher<T>
    }
    header: {
        to: Headerer<T>[]
        match: HeaderMatch<T>[]
    }
    schema: Schematic<T>
    queryKey?: QueryKey<T>
}

//// Main ////

class RequestHandler<T extends Json = Json> extends Module<RequestHandlerSettings<T>> {

    static create<Tx extends Json>(method: HttpMethod, schema: SchemaHook<Tx>): RequestHandler<Tx> {

        const schematic = toSchematic(schema)

        //                       wtf? by default we're doing a hacky check to see
        //                       if there is a query object schema on the given schema
        const queryKey = '$' in ((schematic as any)?.$?.query ?? {})
            ? 'query' as QueryKey<Json>
            : nil
  
        return new RequestHandler({
            method, 
            path: {
                to: createStaticPather('/'),
                match: createStaticPathMatcher('/')
            },
            header: {
                to: [],
                match: []
            },
            schema: schematic,
            queryKey
        })
    }

    constructor(
        settings: RequestHandlerSettings<T>
    ) { 
        super(settings)
    }

    //// Handler Implementation ////

    fromData(data: T): Request {
        const { method, path, schema } = this.data
        const [ url, dataWithoutParams ] = path.to(schema?.validate(data) ?? data)
        const [ headers, dataWithoutHeaders ] = this._addHeaders(dataWithoutParams)
        const [ query, dataWithoutQuery ] = this._resolveQuery(dataWithoutHeaders)

        return {
            method,
            body: dataWithoutQuery,
            url: $path.validate(isEmpty(query) ? url : url + '?' + toQueryString(query)),
            headers
        }
    }

    match(req: Request): T | nil {

        const { method, queryKey, path, schema, header: header } = this.data

        if (method !== req.method)
            return nil

        const { headers = new Headers(), url: urlWithQuery, body = {}} = req

        const [ url, queryString ] = urlWithQuery.split('?')

        const query = queryString ? fromQueryString(queryString) : nil

        const data = (queryKey 
            ? { [queryKey]: query, ...body } 
            : { ...query, ...body }) as Partial<T>

        const pathedData = path.match($path.validate(url), data)
        if (!pathedData)
            return nil

        const headedData = header.match.reduce<Partial<T> | nil>((data, matcher) => data && matcher(headers, data), pathedData)
        if (!headedData)
            return nil
    
        try {
            return schema?.validate(headedData) ?? headedData as T
        } catch {
            return nil
        }
    }

    //// Builder Methods ////

    /**
     * Provide a url as a tempate string, where interpolated object keys will fill in url parameters
     */
    setUrl(urlSegments: TemplateStringsArray, ...urlParamKeys: UrlParamKeys<T>[]): RequestHandler<T> 

    /**
     * Provide a simple static path
     */
    setUrl(path: path): RequestHandler<T> 

    /**
     * Provider pather functions for creating/parsing paths
     */
    setUrl(to: Pather<T>, match: PathMatcher<T>): RequestHandler<T> 

    setUrl(
        ...args: 
        [path] | 
        [Pather<T>, PathMatcher<T>] | 
        [TemplateStringsArray, ...UrlParamKeys<T>[]]
    ): RequestHandler<T> {

        let to: Pather<T> 
        let match: PathMatcher<T>
        if (isFunc(args[0]) && isFunc(args[1])) {
            to = args[0]
            match = args[1]

        } else if (isString(args[0])) {
            to = createStaticPather(args[0])
            match = createStaticPathMatcher(args[0])

        } else {
            const [ segments, ...paramKeys ] = args as [ TemplateStringsArray, ...UrlParamKeys<T>[] ]
            to = createUrlParamPather(segments, ...paramKeys)
            match = createUrlParamPathMatcher(segments, ...paramKeys)
        }

        return new RequestHandler({
            ...this.data,
            path: { to, match },
        })
    }

    get method(): HttpMethod {
        return this.data.method
    }
    getMethod(): HttpMethod {
        return this.method
    }

    get queryKey(): QueryKey<T> | nil {
        return this.data.queryKey
    }
    getQueryKey(): QueryKey<T> | nil {
        return this.queryKey
    }

    /**
     * Changes the method of this request handler
     */
    setMethod(method: HttpMethod): RequestHandler<T> {
        return new RequestHandler<T>({ ...this.data, method })
    }

    get schema(): Schematic<T> {
        return this.data.schema
    }

    /**
     * Sets the schema for this request handler
     */
    setSchema(schema: SchemaHook<T>): RequestHandler<T> {
        return new RequestHandler({ ...this.data, schema: toSchematic(schema) })
    }

    /**
     * Adds methods that manipulate headers
     */
    addHeaderLink(to: Headerer<T>, match: HeaderMatch<T>): RequestHandler<T> {
        const { header } = this.data
        return new RequestHandler({
            ...this.data,
            header: {
                to: [...header.to, to],
                match: [...header.match, match]
            }
        })
    }

    /**
     * Over writes the current header links
     */
    setHeaderLink(to: Headerer<T>, match: HeaderMatch<T>): RequestHandler<T> {
        return new RequestHandler({
            ...this.data,
            header: {
                to: [to],
                match: [match]
            }
        })
    }

    /**
     * Provide an object 
     */
    setQueryKey(queryKey: QueryKey<T> | nil): RequestHandler<T> {
        return new RequestHandler({
            ...this.data,
            queryKey
        })
    }

    //// Helper ////
    
    private _addHeaders(inputData: T | Partial<T>): [ Headers | nil, Partial<T> ] {

        const { header: headerers } = this.data

        const headers = new Headers()
        const outputData = headerers.to.reduce((data, to) => to(headers, data), inputData)

        // only supply headers if some have been added
        let num = 0 
        headers.forEach(() => num++)
        const outputHeaders = num === 0 ? nil : headers
        
        return [ outputHeaders, outputData ]
    }

    private _resolveQuery(data: Partial<T>): [ query: Json, dataWithoutQuery: Partial<T> | nil ] {

        let query: Json = {}
        let dataWithoutQuery: Partial<T> | nil = {...data }

        const queryKey = this.data.queryKey as keyof typeof dataWithoutQuery

        const unknown: unknown = null
        if (isJson.Object(unknown))
            void unknown

        if (queryKey && queryKey in dataWithoutQuery && isJson.Object(dataWithoutQuery[queryKey])) {
            query = (dataWithoutQuery[queryKey] ?? {}) as Json
            delete dataWithoutQuery[queryKey]
        }

        if (this.data.method === HttpMethod.Get) { 
            query = { ...query, ...dataWithoutQuery }
            dataWithoutQuery = nil
        }

        return [ query, dataWithoutQuery ]

    }
}

//// Exports ////

export default RequestHandler

export {
    RequestHandler,
    RequestHandler as Req,
}