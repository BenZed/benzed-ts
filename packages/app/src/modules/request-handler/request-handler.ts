import is from '@benzed/is'
import { nil } from '@benzed/util'

import { 
    createStaticPather, 
    createUrlParamPather, 
    Pather 
} from './pathers'

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
        private readonly _pather: Pather<T> = createStaticPather('/')
    ) { 
        super()
    }

    //// Handler Implementation ////

    toRequest(data: T, urlPrefix?: Path): Request {
    
        const { method } = this

        const [ url, dataWithoutParams ] = this._createPath(data, urlPrefix)

        const body = method === HttpMethod.Get ? undefined : dataWithoutParams

        return {
            method,
            body,
            url,
            headers: undefined
        }
    }

    matchRequest(req: Request): T | nil {
        //
    }

    //// Builder Methods ////
    
    /**
     * Provide a url as a tempate string, where interpolated object keys will fill in url parameters
     */
    setUrl(str: TemplateStringsArray, ...properties: UrlParamKeys<T>[]): RequestHandler<T> 
    
    /**
     * Provide a simple static path
     */
    setUrl(path: Path): RequestHandler<T> 

    /**
     * Provide a pather function to create urls.
     * 
     * Given data, a pather will return a path and subset
     * data containing fields that were not used
     * in the query or url parameters when constructing the
     * path. 
     */
    setUrl(pather: Pather<T>): RequestHandler<T> 
    
    setUrl(fParam: TemplateStringsArray | Path | Pather<T>, ...rParams: UrlParamKeys<T>[]): RequestHandler<T> {

        const pather = is.string(fParam)
            ? createStaticPather<T>(fParam)
            : is.function(fParam) 
                ? fParam
                : createUrlParamPather(fParam, ...rParams)

        return new RequestHandler(
            this.method,
            pather
        )
    }

    /**
     * Changes the method of this request handler
     */
    setMethod(method: HttpMethod): RequestHandler<T> {
        return new RequestHandler<T>(method, this._pather)
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