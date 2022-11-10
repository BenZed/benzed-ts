import { HttpMethod } from './http-methods'
import { Path } from '../../types'
import { returns } from '@benzed/util'

//// Type ////

interface Request {
    method: HttpMethod
    url: Path
    body?: object
    headers?: Headers
}

/**
 * Keys on an object that have string as a value
 */
 type UrlParamFields<T> = keyof {
     [K in keyof T as T[K] extends string | number | undefined | null ? K : never]: never
 }

//// Base ////

abstract class _RequestHandler<T> {

    // abstract get methods(): HttpMethod[]

    abstract toRequest(data: T): Request

    abstract matchRequest(input: Request): T | null

}

/**
 * Given data, a pather will return a path and a subset
 * data object containing fields that were not used
 * in the query or url parameters when constructing the
 * path. If no object is returned, then no data was 
 * used
 */
type Pather<T> = (data: T) => [Path, Partial<T>] | [Path]

//// Default ////

// Builder Pattern all goddamn day
class RequestHandler<T> extends _RequestHandler<T> {

    static create<Tx>(method: HttpMethod): RequestHandler<Tx> {
        return new RequestHandler<Tx>(method)
    }

    private constructor(
        readonly method: HttpMethod,
        private readonly _pather: Pather<T> = returns(['/'])
    ) {
        super()   
    }

    private _createPath(data: T): ReturnType<Pather<T>> {

        const [urlWithoutQueryParams, dataWithoutUrlParams] = this._pather(data)
        return ['/']
    }

    toRequest(data: T): Request {
    
        const { method } = this

        const [ url, dataWithoutParams ] = this._createPath(data)

        return {
            method,
            body: undefined,
            url,
            headers: undefined
        }

    }

    matchRequest(input: Request): T | null {
        return null
    }

    url(str: TemplateStringsArray, ...properties: UrlParamFields<T>[]): RequestHandler<T> 
    url(path: Path): RequestHandler<T> 
    
    url(pathOrArray: TemplateStringsArray | Path, ...props: UrlParamFields<T>[]): RequestHandler<T> {

        //

        return new RequestHandler(
            this.method
        )
    }

}

//// Exports ////

export default RequestHandler

export {
    RequestHandler,
    Request,
}