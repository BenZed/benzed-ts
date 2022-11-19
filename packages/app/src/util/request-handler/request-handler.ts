import is from '@benzed/is'
import { Map, nil, numKeys } from '@benzed/util'
import { SchemaFor } from '@benzed/schema'

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

    toQueryString

} from '..'

//// Types ////

interface RequestConverter<T extends object> {
    toRequest(data: T): Request
    matchRequest(input: Request): T | nil
}

type Headerer<T extends object> = (headers: Headers, data: Partial<T>) => Partial<T>

type HeaderMatch<T extends object> = (headers: Headers, data: Partial<T>) => Partial<T> | nil

//// Helper ////

function hasQuery<T extends object>(input: T): input is T & { query: object } {
    return is.object<{ query?: object }>(input) && is.object(input.query)
}

//// Main ////

class RequestHandler<T extends object> implements RequestConverter<T> {

    static create<Tx extends object>(method: HttpMethod): RequestHandler<Partial<Tx>>

    static create<Tx extends object>(method: HttpMethod, schema: SchemaFor<Tx>): RequestHandler<Tx>

    static create(method: HttpMethod, schema?: SchemaFor<object>): RequestHandler<object> {
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
            schema,
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
        private readonly _schema?: SchemaFor<T>,
    ) { }

    //// Handler Implementation ////

    toRequest(data: T, urlPrefix?: Path): Request {
    
        const { method } = this

        const [ url, dataWithoutParams ] = this._createPath(this._schema?.validate(data) ?? data, urlPrefix)

        const [headers, dataWithoutHeaders] = this._addHeaders(dataWithoutParams)

        const isGet = method === HttpMethod.Get
        const body = isGet ? undefined : dataWithoutHeaders
        if (isGet && numKeys(dataWithoutHeaders) > 0)
            throw new Error(`Unhandled data: ${dataWithoutHeaders}`)

        return {
            method,
            body,
            url,
            headers
        }
    }

    matchRequest(req: Request): T | nil {

        const { method } = this

        if (method !== req.method)
            return nil

        const { headers = new Headers(), url, body = {}} = req

        const pathedData = this._path.match(url, body ?? {}) 
        if (!pathedData)
            return nil

        const headedData = this._headers.match.reduce<Partial<T> | nil>((data, matcher) => data && matcher(headers, data), pathedData)
        if (!headedData)
            return nil
    
        try {
            return this._schema?.validate(headedData) ?? headedData as T
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

        return new RequestHandler(this.method, { to, match }, this._headers, this._schema)
    }

    /**
     * Changes the method of this request handler
     */
    setMethod(method: HttpMethod): RequestHandler<T> {
        return new RequestHandler<T>(method, this._path, this._headers, this._schema)
    }

    /** 
     * Sets the schema for this request handler
     */
    setSchema(schema: SchemaFor<T>): RequestHandler<T> {
        return new RequestHandler(this.method, this._path, this._headers, schema)
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
            this._schema
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
            this._schema
        )
    }

    //// Helper ////
    
    private _createPath(data: T, urlPrefix?: Path): ReturnType<Pather<T>> {

        const [ urlWithoutPrefix, dataWithoutUrlParams ] = this._path.to(data)

        const url = $path.validate(urlPrefix ?? '' + urlWithoutPrefix)

        if (hasQuery(dataWithoutUrlParams)) {
            const { query, ...dataWithoutUrlParamsOrQuery } = dataWithoutUrlParams
            return [
                url + toQueryString(query) as Path,
                dataWithoutUrlParamsOrQuery as Partial<T>
            ]
        }

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
}

//// Exports ////

export default RequestHandler

export {
    RequestHandler,
    RequestConverter
}