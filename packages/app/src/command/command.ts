import { HttpCode } from "../modules/connection/server/http-codes"
import { HttpMethod } from "../modules/connection/server/http-methods"

import { inputToOutput, StringKeys } from "@benzed/util"
import $, { Asserts } from "@benzed/schema"
import { toDashCase } from '@benzed/string'
import is from '@benzed/is'

import {
    Request,
    ToRequest, 
    FromRequest, 
    
    createToReq,
    createFromReq,
    createNameToReq, 
    createNameFromReq 
} from './request'

import { pluck } from "@benzed/array/lib"

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

/*** Types ***/

type ResultCode = {
    code: HttpCode
}

type Context = {
    name: string
    data: object
    result: object | null
}

type Validator<T extends object> = (i: unknown) => T

type CommandName<C extends Command<any,any,any>> = C extends Command<infer N, any, any> ? N : never
type CommandData<C extends Command<any,any,any>> = C extends Command<any, infer D, any> ? D : never
type CommandResult<C extends Command<any,any,any>> = C extends Command<any, any, infer R> ? R : never

/*** Helper ***/

const isObject: Validator<object> = $.object.validate

const $dashCase = $.string
    .length(`>`, 0)
    .asserts(i => i === toDashCase(i), i => `"${i}" must be dash cased`)

const assertsDashCase: Asserts<typeof $dashCase> = $dashCase.assert 

/*** Command ***/

class Command<N extends string, D extends {}, R extends ResultCode> {
    
    static create<Nx extends string>(name: Nx): Command<Nx, object, ResultCode> {

        assertsDashCase(name)

        return new Command(
            name,
            isObject,
            inputToOutput
        )
    } 

    private constructor(
        readonly name: N,
        readonly validateData: Validator<D>,
        readonly validateResult: Validator<R> | typeof inputToOutput,
        private readonly _toReq: ToRequest<D> = createNameToReq(name),
        private readonly _fromReq: FromRequest<D> = createNameFromReq(name)
    ) {
    }

    // Build Interface

    /**
     * Set data validation for this command
     */
    data<Dx extends object>(
        validateData: Validator<Dx>
    ): Command<N, Dx, R> {
        return new Command(
            this.name,
            validateData,
            this.validateResult
        )
    }

    /**
     * Set explicit request converters
     * for this command
     */
    req(
        toReq: ToRequest<D>,
        fromReq: FromRequest<D>
    ): Command<N,D,R> 

    /**
     * Create generic request converters for this command
     */
    req(
        method: HttpMethod,
        url: `/${string}`,
        param?: StringKeys<D>
    ): Command<N,D,R> 
    
    req(...args: any[]): any {

        const funcs = pluck(args, is.function)

        let toReq: ToRequest<D>
        let fromReq: FromRequest<D>
        
        if (funcs.length === 2) {
            toReq = funcs[0] as any
            fromReq = funcs[1] as any
        } else {
            const [method, url, param] = args
            toReq = createToReq(method, url, param)
            fromReq = createFromReq(method, url, param)
        }

        return new Command(
            this.name,
            this.validateData,
            this.validateResult,
            toReq,
            fromReq
        )

    }

    /**
     * Set result type or validation for this command
     */
    result<Rx extends object>(
        validateResult?: Validator<Rx>
    ): Command<N, D, Rx & ResultCode> {

        const _validateResult = validateResult 
            ? (i: unknown) => ({
                ...validateResult(i),
                code: HttpCode.Ok 
            })
            : inputToOutput

        return new Command(
            this.name,
            this.validateData,
            _validateResult,
            this._toReq,
            this._fromReq
        )
    }

    toReq(data: D): Request<D> {
        return this._toReq(data)
    }

    fromReq(request: Request<D>): D | null{

        const data = this._fromReq(request)
        if (!data)
            return null

        return this.validateData(data)
    }

    // Runtime Interface

}

/*** Exports ***/

export default Command

export {
    
    Command,
    CommandData,
    CommandName,
    CommandResult,
    ResultCode as CommandResultCode,
    Validator as CommandDataValidator,
    ToRequest as CommandToRequest,
    FromRequest as RequestToCommandData,

    Context
}