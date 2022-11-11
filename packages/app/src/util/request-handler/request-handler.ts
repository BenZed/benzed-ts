
import is from '@benzed/is'
import { nil, omit } from '@benzed/util'

import { 
    createStaticPather, 
    createUrlParamPather, 
    Pather 
} from './pathers'

import { 
    Request,
    Path,
    HttpMethod, 
    UrlParamKeys, 
     
    toQueryString 
} from '../../util'

//// Base ////

abstract class _RequestHandler<T> {

    // abstract get methods(): HttpMethod[]

    abstract toRequest(data: T): Request

    abstract matchRequest(input: Request): T | nil

}

//// Main ////

class RequestHandler<T extends object> extends _RequestHandler<T> {

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

        const [ urlWithoutPrefix, dataWithoutParams ] = this._createPath({...data})

        const url = `${urlPrefix ?? ''}${urlWithoutPrefix}` as Path

        const body = method === HttpMethod.Get ? undefined : dataWithoutParams

        return {
            method,
            body,
            url,
            headers: undefined
        }

    }

    matchRequest(input: Request): T | nil {
        return nil
    }

    //// Builder Methods ////
    
    /**
     * Provide a url as a tempate string, where interpolated object keys will fill in url parameters
     */
    url(str: TemplateStringsArray, ...properties: UrlParamKeys<T>[]): RequestHandler<T> 
    
    /**
     * Provide a simple static path
     */
    url(path: Path): RequestHandler<T> 

    /**
     * Provide a pather function to create urls.
     * 
     * Given data, a pather will return a path and subset
     * data containing fields that were not used
     * in the query or url parameters when constructing the
     * path. 
     * 
     * If no object is returned, then no data was used.
     */
    url(pather: Pather<T>): RequestHandler<T> 
    
    url(fParam: TemplateStringsArray | Path | Pather<T>, ...rParams: UrlParamKeys<T>[]): RequestHandler<T> {

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

    //// Helper ////
    
    private _createPath(data: T): ReturnType<Pather<T>> {

        const [url, dataOmitUrlParams ] = this._pather(data)

        const queryParams = this.method === HttpMethod.Get 
            ? dataOmitUrlParams
            : nil

        const urlWithQuery = queryParams && url + toQueryString(queryParams) as Path

        const dataOmitUrlAndQueryParams = dataOmitUrlParams && 
            queryParams && 
            omit(dataOmitUrlParams, ...Object.keys(queryParams) as []) as Partial<T>

        return [ urlWithQuery ?? url, dataOmitUrlAndQueryParams ?? dataOmitUrlParams ] 
            
    }

}

//// Exports ////

export default RequestHandler

export {
    RequestHandler
}