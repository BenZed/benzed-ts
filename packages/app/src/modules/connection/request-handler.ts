import { HttpMethod } from './http-methods'
import { Path } from '../../types'

import is, { isNumber } from '@benzed/is'
import { omit, returns } from '@benzed/util'

import toQueryString from './to-query-string'
import path from 'path'

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

        const [urlWithoutQueryParams, dataWithoutUrlParams = data ] = this._pather(data)

        const queryParams = this.method === HttpMethod.Get 
            ? dataWithoutUrlParams
            : null

        const urlWithQueryParams = queryParams
            ? (urlWithoutQueryParams.replace(/\/$/, '') || '/') + toQueryString(queryParams) as Path
            //                                                                       ^ just in case removing the last dash results in an empty string
            : urlWithoutQueryParams

        const dataWithoutQueryParams = queryParams 
            ? omit(dataWithoutUrlParams, ...Object.keys(queryParams) as [])
            : dataWithoutUrlParams 

        return (dataWithoutUrlParams 
            ? [urlWithQueryParams, dataWithoutQueryParams] 
            : [dataWithoutQueryParams]) as ReturnType<Pather<T>>
    }

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

    matchRequest(input: Request): T | null {
        return null
    }

    url(str: TemplateStringsArray, ...properties: UrlParamFields<T>[]): RequestHandler<T> 
    url(path: Path): RequestHandler<T> 
    
    url(pathOrArray: TemplateStringsArray | Path, ...props: UrlParamFields<T>[]): RequestHandler<T> {

        let pather: Pather<T>
        if (props.length > 0) {
            pather = (data) => {
                const dataWithoutUrlParams = {...data}
                let url = '/'
                for (let i = 0; i < props.length; i++) {
                    const key = props[i] as keyof T
                    const value = data[key] as string | number | undefined
                    delete dataWithoutUrlParams[key]

                    url = pathOrArray[i] + (isNumber(value) || value ? `${url}/${value}` : url) 
                }
                const urlWithoutMultiSlashes = url.replace(/\/+/gi, '/') as Path

                return [urlWithoutMultiSlashes, dataWithoutUrlParams]
            }
        } else 
            pather = () => [[...pathOrArray].join('') as Path]

        return new RequestHandler(
            this.method,
            pather
        )
    }

}

//// Exports ////

export default RequestHandler

export {
    RequestHandler,
    Request,
}