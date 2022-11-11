
import { HttpMethod } from 'koa-body'
import { Path } from '../types'

//// Type ////

export interface Request {
    method: HttpMethod
    url: Path
    body?: object
    headers?: Headers
}
