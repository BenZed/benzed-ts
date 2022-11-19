import is from '@benzed/is'
import { nil } from '@benzed/util'

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

//// Base ////

interface RequestConverter<T> {

    toRequest(data: T): Request

    matchRequest(input: Request): T | nil

}

//// Main ////

class RequestHandler<T extends object> implements RequestConverter<T> {

    static create<Tx extends object>(method: HttpMethod): RequestHandler<Tx> {
        return new RequestHandler<Tx>(
            method, 
            {
                to: createStaticPather('/'),
                match: createStaticPathMatcher('/')
            }
        )
    }

    private constructor(
        readonly method: HttpMethod,
        private readonly _path: {
            to: Pather<T>
            match: PathMatcher<T>
        }
    ) { }

    //// Handler Implementation ////

    toRequest(data: T, urlPrefix?: Path): Request {
    
        const { method } = this

        const [ url, dataWithoutParams ] = this._createPath(data, urlPrefix)

        const isGet = method === HttpMethod.Get

        const body = isGet ? undefined : dataWithoutParams
        if (!isGet && Object.keys(dataWithoutParams).length > 0)
            throw new Error(`Unhandled data: ${dataWithoutParams}`)

        return {
            method,
            body,
            url,
            headers: undefined
        }
    }

    matchRequest(req: Request): T | nil {

        const { method } = this
        if (method !== req.method)
            return nil

        const isGet = method === HttpMethod.Get

        const [url, queryOrBody] = [req.url, isGet ? /* remove query from body */ {} : req.body ?? {}]

        const pathedData = this._path.match(url, queryOrBody) as T | nil

        // const headedData = this._unheader(req.headers, pathedData)

        return pathedData
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
    setUrl(pather: Pather<T>, pathMatcher: PathMatcher<T>): RequestHandler<T> 
    
    setUrl(...args: [Path] | [Pather<T>, PathMatcher<T>] | [TemplateStringsArray, ...UrlParamKeys<T>[]]): RequestHandler<T> {

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

        return new RequestHandler(this.method, { to, match })
    }

    /**
     * Changes the method of this request handler
     */
    setMethod(method: HttpMethod): RequestHandler<T> {
        return new RequestHandler<T>(method, this._path)
    }

    //// Helper ////
    
    private _createPath(data: T, urlPrefix?: Path): ReturnType<Pather<T>> {

        const [ urlWithoutPrefix, dataWithoutUrlParams ] = this._path.to(data)

        const url = $path.validate(urlPrefix ?? '' + urlWithoutPrefix)

        const isGetMethod = this.method === HttpMethod.Get 
        return isGetMethod 
            ? [ url + toQueryString(dataWithoutUrlParams) as Path, {} ]
            : [ url, dataWithoutUrlParams ]
    }
}

//// Exports ////

export default RequestHandler

export {
    RequestHandler,
    RequestConverter
}