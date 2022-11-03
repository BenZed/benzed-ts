import { isObject, isString } from '@benzed/is'
import { Chain, chain, Link } from '@benzed/util'
import { pluck } from '@benzed/array'

import CommandModule from './command-module'

import { Path } from '../types'
import { HttpMethod } from '../modules'
import { createFromReq, createToReq, Request, StringFields } from './request'

/* eslint-disable 
    @typescript-eslint/explicit-function-return-type
*/

//// Types ////

/**
 * Command without build interface
 */
export type RuntimeCommand<I extends object> = 
    Omit<Command<string, I, object>, 'useHook'>

// type CommandHookTypeGuard<I extends object, O extends I, N extends string> = 
//     ((this: RuntimeCommand<N, I>, input: I) => input is O) | TypeGuard<O, I>

// export type CommandHookPredicate<I extends object, N extends string> = 
//     ((this: RuntimeCommand<N,I>, input: I) => boolean) | Link<I, boolean>

export type CommandHook<I extends object, O extends object> =
    ((this: RuntimeCommand<I>, input: I) => O) | Link<I, O> 

type CommandValidate<I extends object> = { validate: Link<I, I> }

//// Command ////

class Command<N extends string, I extends object, O extends object> extends CommandModule<N,I,O> {

    //// Static Interface ////

    /**
     * Create a new generic command
     * @param name - Name of the command, must be dash-cased.
     * @param validate - Validate incoming idata
     * @param method - Http method this command maps to
     * @param path - url endpoint this command maps to
     * @returns new Command
     */
    static create<Nx extends string, Ix extends object>(
        name: Nx,
        validate: CommandValidate<Ix>,
        method?: HttpMethod,
        path?: Path
    ): Command<Nx, Ix, Ix>

    /**
     * Convience method for defining a POST command named 'create'
     * @param validate - Validate incoming idata
     * @returns - new POST Command
     */
    static create<Ix extends object>(
        validate: CommandValidate<Ix>,
    ): Command<'create', Ix, Ix>

    static create(...args: unknown[]) {

        const isNamed = isString(args[0])

        const [
            { validate }
        ] = pluck(args, isObject<CommandValidate<object>>)

        const [
            name = 'create', 
            method = HttpMethod.Post, 
            path = name === 'create' ? '/' : `/${name}`

        ] = (isNamed
            ? args
            : ['create', ...args]) as [string | undefined, HttpMethod | undefined, Path | undefined]

        return new Command(name, validate, method, path)
    }

    /**
     * Convience interface for defining a GET command named 'get'
     * @param validate - Validate incoming idata
     * @returns new GET Command
     */
    static get = <Ix extends object>(
        validate: CommandValidate<Ix>,
    ) => this.create('get', validate, HttpMethod.Get, '/')

    /**
     * Convience interface for defining a GET command named 'find'
     * @param validate - Handle command input to output
     * @returns new GET Command
     */
    static find = <Ix extends object>(
        validate: CommandValidate<Ix>,
    ) => this.create('find', validate, HttpMethod.Get, '/')

    /**
     * Convience interface for defining a DELETE command named 'delete'
     * @param validate - Validate incoming idata
     * @returns new DELETE Command
     */
    static delete = <Ix extends object>(
        validate: CommandValidate<Ix>,
    ) => this.create('delete', validate, HttpMethod.Delete, '/')
        
    /**
     * Convience interface for defining a DELETE command named 'remove'
     * @param validate - validate incoming data
     * @returns new DELETE Command
     */
    static remove = <Ix extends object>(
        validate: CommandValidate<Ix>,
    ) => this.create('remove', validate, HttpMethod.Delete, '/')

    /**
     * Convience interface for defining a PATCH command named 'patch'
     * @param validate - validate incoming data
     * @returns new PATCH Command
     */
    static patch = <Ix extends object>(
        validate: CommandValidate<Ix>,
    ) => this.create('patch', validate, HttpMethod.Patch, '/')

    /**
     * Convience interface for defining a PATCH command named 'edit'
     * @param validate - validate incoming data
     * @returns new PATCH Command
     */
    static edit = <Ix extends object>(
        validate: CommandValidate<Ix>,
    ) => this.create('edit', validate, HttpMethod.Patch, '/')

    /**
     * Convience interface for defining a PUT command named 'update'
     * @param validate - validate incoming data
     * @returns new PUT Command
     */
    static update = <Ix extends object>(
        validate: CommandValidate<Ix>,
    ) => this.create('update', validate, HttpMethod.Put, '/')

    /**
     * Convience interface for defining a OPTIONS command named 'options'
     * @param validate - validate incoming data
     * @returns new OPTIONS Command
     */
    static options = <Ix extends object>(
        validate: CommandValidate<Ix>,
    ) => this.create('options', validate, HttpMethod.Options, '/')
        
    //// Sealed ////
    
    private constructor(
        name: N,
        hookOrValidate: CommandHook<I, O>,
        readonly _method: HttpMethod,
        readonly _path: Path
    ) {
        super(name)
        this._execute = chain(hookOrValidate)
    }

    protected readonly _execute: Chain<I,O> 

    protected override get _copyParams(): unknown[] {
        return [
            this.name,
            this._execute,
            this.http.method,
            this.http.path
        ]
    }

    //// State ////
    
    get http(): { method: HttpMethod, path: Path } {
        const { _method: method, _path: path } = this
        return { method, path }
    }

    override get methods(): [HttpMethod] {
        return [this.http.method]
    }

    //// Valiation Interface ////

    /**
     * Validates given input 
     */
    validateData(data: object): I {
        return this._execute.links[0](data) as I
    }

    /**
     * Is the given input valid data for this command?
     */
    isData(data: object): data is I {
        try {
            this.validateData(data)
            return true
        } catch {
            return false
        }
    }

    //// Request Interface ////
    
    toRequest(input: I): Request<I, StringFields<I>> {
        return createToReq<I, StringFields<I>>(this.http.method, this.http.path)(input)
    }

    fromRequest(method: HttpMethod, url: string, data: object): I | null {
        return createFromReq(this.http.method, this.http.path)([method, url, data]) as I | null
    }

    //// Instance Build Interface ////

    // TODO add first class match support
    /**
     * Add a hook that conditionally executes given the output of a
     * supplied predicate method
     */
    // useHook<Ox extends object>(
    //     predicate: CommandHookPredicate<Ox, N>,
    //     hook: CommandHook<O, Ox, N>
    // ): Command<N, I, Ox>

    /**
     * Add a hook to this command
     */
    useHook<Ox extends object>(hook: CommandHook<O, Ox>): Command<N, I, Ox> {

        const { name, http } = this

        return new Command(
            name,
            this._execute.append(hook),
            http.method,
            http.path
        )
    }

}

//// Exports ////

export default Command

export {
    Command
}