import is from '@benzed/is'
import { nil } from '@benzed/util'

import { 
    createStaticPather, 
    createUrlParamPather, 
    Pather 
} from './pathers'
import { 
    createStaticUnpather, 
    createUrlParamUnpather, 
    Unpather 
} from './un-pathers'

import { 

    Request,

    Path,
    $path, 

    HttpMethod, 
    UrlParamKeys, 

    toQueryString

} from '../../util'

import { Module } from '../../module'

//// Base ////

interface RequestConverter<T> {

    toRequest(data: T): Request

    matchRequest(input: Request): T | nil

}

//// Main ////

class RequestHandler<T extends object> extends Module implements RequestConverter<T> {

    static create<Tx extends object>(method: HttpMethod): RequestHandler<Tx> {
        return new RequestHandler<Tx>(method)
    }

    private constructor(
        readonly method: HttpMethod,
        private readonly _pather: Pather<T> = createStaticPather('/'),
        private readonly _unpather: Unpather<T> = createStaticUnpather('/')
    ) { 
        super()
    }

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
        const isGet = method === HttpMethod.Get

        const [url, queryOrBody] = [req.url, isGet ? /* remove query from body */ {} : req.body ?? {}]

        const pathedData = this._unpather(url, queryOrBody) as T | nil

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
    setUrl(pather: Pather<T>, unpather: Unpather<T>): RequestHandler<T> 
    
    setUrl(...args: [Path] | [Pather<T>, Unpather<T>] | [TemplateStringsArray, ...UrlParamKeys<T>[]]): RequestHandler<T> {

        let pather: Pather<T> 
        let unpather: Unpather<T>
        if (is.function(args[0]) && is.function(args[1])) {
            pather = args[0]
            unpather = args[1]

        } else if (is.string(args[0])) {
            pather = createStaticPather(args[0])
            unpather = createStaticUnpather(args[0])

        } else {
            const [ segments, ...paramKeys ] = args as [ TemplateStringsArray, ...UrlParamKeys<T>[] ]
            pather = createUrlParamPather(segments, ...paramKeys)
            unpather = createUrlParamUnpather(segments, ...paramKeys)
        }

        return new RequestHandler(
            this.method,
            pather,
            unpather
        )
    }

    /**
     * Changes the method of this request handler
     */
    setMethod(method: HttpMethod): RequestHandler<T> {
        return new RequestHandler<T>(method, this._pather, this._unpather)
    }

    //// Helper ////
    
    private _createPath(data: T, urlPrefix?: Path): ReturnType<Pather<T>> {

        const [ urlWithoutPrefix, dataWithoutUrlParams ] = this._pather(data)

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
    RequestHandler
}