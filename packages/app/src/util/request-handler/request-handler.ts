import is from '@benzed/is'
import { isEmpty, nil, KeysOf } from '@benzed/util'
import { Schematic } from '@benzed/schema'

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

    Path,
    $path, 

    HttpMethod, 
    UrlParamKeys, 

} from '..'

import { 
    parse as fromQueryString,
    stringify as toQueryString
} from 'query-string'

//// Eslint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type Headerer<T extends object> = (headers: Headers, data: Partial<T>) => Partial<T>

type HeaderMatch<T extends object> = (headers: Headers, data: Partial<T>) => Partial<T> | nil

/**
 * Keys that can be used to store/retreive query object.
 */
type QueryKey<T extends object> = keyof {
    [K in KeysOf<T> as T[K] extends object | nil ? K : never]: K
}

//// Main ////

class RequestHandler<T extends object> {

    static create<Tx extends object>(method: HttpMethod): RequestHandler<Partial<Tx>>

    static create<Tx extends object>(method: HttpMethod, schema: Schematic<Tx>): RequestHandler<Tx>

    static create(method: HttpMethod, schematic?: Schematic<object>): RequestHandler<object> {

        //                       wtf? by default we're doing a hacky check to see
        //                       if there is a query object schema on the given schema
        const defaultQueryKey = '$' in ((schematic as any)?.$?.query ?? {})
            ? 'query'
            : nil
  
        return new RequestHandler<object>(
            method, 
            {
                to: createStaticPather('/'),
                match: createStaticPathMatcher('/')
            },
            {
                to: [],
                match: []
            },
            schematic,
            defaultQueryKey as nil
        )
    }

    private constructor(

        readonly method: HttpMethod,

        private readonly _path: {
            to: Pather<T>
            match: PathMatcher<T>
        },

        private readonly _headers: {
            to: Headerer<T>[]
            match: HeaderMatch<T>[]
        },

        readonly schema?: Schematic<T>,

        readonly queryKey?: QueryKey<T>

    ) { }

    //// Handler Implementation ////

    to(data: T, urlPrefix?: Path): Request {
    
        const { method } = this

        const [ url, dataWithoutParams ] = this._createPath(this.schema?.validate(data) ?? data, urlPrefix)

        const [ headers, dataWithoutHeaders ] = this._addHeaders(dataWithoutParams)

        const [ query, dataWithoutQuery ] = this._resolveQuery(dataWithoutHeaders)

        return {
            method,
            body: dataWithoutQuery,
            url: isEmpty(query) ? url : url + '?' + toQueryString(query) as Path,
            headers
        }
    }

    match(req: Request): T | nil {

        const { method } = this
        if (method !== req.method)
            return nil

        const { headers = new Headers(), url: urlWithQuery, body = {}} = req

        const [ url, queryString ] = urlWithQuery.split('?') as [ Path, string | nil ]

        const query = queryString ? fromQueryString(queryString) : nil

        const data: object = this.queryKey 
            ? { [this.queryKey]: query, ...body } 
            : { ...query, ...body }

        const pathedData = this._path.match(url, data)
        if (!pathedData)
            return nil

        const headedData = this._headers.match.reduce<Partial<T> | nil>((data, matcher) => data && matcher(headers, data), pathedData)
        if (!headedData)
            return nil
    
        try {
            return this.schema?.validate(headedData) ?? headedData as T
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
    setUrl(path: Path): RequestHandler<T> 
     
    /**
     * Provider pather functions for creating/parsing paths
     */
    setUrl(to: Pather<T>, match: PathMatcher<T>): RequestHandler<T> 
    
    setUrl(
        ...args: [Path] | [Pather<T>, PathMatcher<T>] | [TemplateStringsArray, ...UrlParamKeys<T>[]]
    ): RequestHandler<T> {

        let to: Pather<T> 
        let match: PathMatcher<T>
        if (is.function(args[0]) && is.function(args[1])) {
            to = args[0]
            match = args[1]

        } else if (is.string(args[0])) {
            to = createStaticPather(args[0])
            match = createStaticPathMatcher(args[0])

        } else {
            const [ segments, ...paramKeys ] = args as [ TemplateStringsArray, ...UrlParamKeys<T>[] ]
            to = createUrlParamPather(segments, ...paramKeys)
            match = createUrlParamPathMatcher(segments, ...paramKeys)
        }

        return new RequestHandler(this.method, { to, match }, this._headers, this.schema, this.queryKey)
    }

    /**
     * Changes the method of this request handler
     */
    setMethod(method: HttpMethod): RequestHandler<T> {
        return new RequestHandler<T>(method, this._path, this._headers, this.schema, this.queryKey)
    }

    /** 
     * Sets the schema for this request handler
     */
    setSchema(schema: Schematic<T> | nil): RequestHandler<T> {
        return new RequestHandler(this.method, this._path, this._headers, schema, this.queryKey)
    }

    /**
     * Adds methods that manipulate headers
     */
    addHeaderLink(to: Headerer<T>, match: HeaderMatch<T>): RequestHandler<T> {

        const headers = this._headers

        return new RequestHandler(
            this.method, 
            this._path, 
            {
                to: [...headers.to, to],
                match: [...headers.match, match]
            }, 
            this.schema,
            this.queryKey
        )
    }

    /**
     * Over writes the current header links
     */
    setHeaderLink(to: Headerer<T>, match: HeaderMatch<T>): RequestHandler<T> {

        return new RequestHandler(
            this.method, 
            this._path, 
            {
                to: [to],
                match: [match]
            }, 
            this.schema,
            this.queryKey
        )
    }

    /**
     * Provide an object 
     */
    setQueryKey(queryKey: QueryKey<T> | nil): RequestHandler<T> {
        return new RequestHandler(
            this.method, 
            this._path, 
            this._headers, 
            this.schema,
            queryKey
        )
    }

    //// Helper ////
    
    private _createPath(data: T, urlPrefix?: Path): ReturnType<Pather<T>> {

        const [ urlWithoutPrefix, dataWithoutUrlParams ] = this._path.to(data)

        const url = $path.validate(urlPrefix ?? '' + urlWithoutPrefix)
        return [ url, dataWithoutUrlParams ]
    }

    private _addHeaders(inputData: T | Partial<T>): [ Headers | nil, Partial<T> ] {

        const headers = new Headers()
        const outputData = this._headers.to.reduce((data, to) => to(headers, data), inputData)

        // only supply headers if some have been added
        let num = 0 
        headers.forEach(() => num++)
        const outputHeaders = num === 0 ? nil : headers
        
        return [ outputHeaders, outputData ]
    }

    private _resolveQuery(data: Partial<T>): [ query: object, dataWithoutQuery: Partial<T> | nil ] {

        let query: Record<string, unknown> = {}
        let dataWithoutQuery: Partial<T> | nil = {...data }

        const queryKey = this.queryKey as keyof typeof dataWithoutQuery
        if (queryKey && queryKey in dataWithoutQuery) {
            query = dataWithoutQuery[queryKey] ?? {}
            delete dataWithoutQuery[queryKey]
        }

        if (this.method === HttpMethod.Get) { 
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