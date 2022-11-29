import is from '@benzed/is'
import { pluck } from '@benzed/array'
import { Schematic } from '@benzed/schema'
import { toDashCase } from '@benzed/string'
import { Chain, chain, Link, nil } from '@benzed/util'

import CommandModule from './command-module'

import { HttpMethod, Path, Request, RequestHandler as Req, UrlParamKeys } from '../util'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/explicit-function-return-type
*/

//// Types ////

/**
 * Command without build interface
 */
export type RuntimeCommand<I extends object> = 
    Omit<Command<string, I, object>, 'useHook' | 'useName' | 'useReq' | 'useUrl' | 'useProvide'>

export type CommandHook<I extends object, O extends object> =
    ((this: RuntimeCommand<I>, input: I) => O) | Link<I, O>

type CommandInput<C> = C extends Command<any, infer I, any> ? I : unknown

type CommandOutput<C> = C extends Command<any, any, infer O> ? O : unknown

//// Command ////
class Command<N extends string, I extends object, O extends object> extends CommandModule<N, I, O> {

    //// Static Interface ////

    /**
     * Create a new generic command
     * @param name - Name of the command, must be dash-cased.
     * @param schema - Validate incoming idata
     * @param method - Http method this command maps to
     * @param path - url endpoint this command maps to
     * @returns new Command
     */
    static create<Nx extends string, Ix extends object>(
        name: Nx,
        schema: Schematic<Ix>,
        method?: HttpMethod,
        path?: Path
    ): Command<Nx, Ix, Ix>

    /**
     * Convience method for defining a POST command named 'create'
     * @param schema - Validate incoming idata
     * @returns - new POST Command
     */
    static create<Ix extends object>(
        schema: Schematic<Ix>,
    ): Command<'create', Ix, Ix>

    static create(...args: unknown[]) {

        const isNamed = is.string(args[0])

        const [ schema ] = pluck(args, is.object) as [ Schematic<object> ]

        const [
            name = 'create', 
            method = HttpMethod.Post, 
            path = name === 'create' ? '/' : `/${toDashCase(name)}`
        ] = (
            isNamed
                ? args
                : ['create', ...args]
        ) as [string | nil, HttpMethod | nil, Path | nil]

        const req = Req
            .create(method)
            .setUrl(path)

        return new Command(
            name, 
            schema, 
            schema.validate, 
            req
        )
    }

    /**
     * Convience interface for defining a GET command named 'get'
     * @param schema - Validate incoming idata
     * @returns new GET Command
     */
    static get = <Ix extends object>(
        schema: Schematic<Ix>,
    ) => this.create('get', schema, HttpMethod.Get, '/')

    /**
     * Convience interface for defining a GET command named 'find'
     * @param schema - Handle command input to output
     * @returns new GET Command
     */
    static find = <Ix extends object>(
        schema: Schematic<Ix>,
    ) => this.create('find', schema, HttpMethod.Get, '/')

    /**
     * Convience interface for defining a DELETE command named 'delete'
     * @param schema - Validate incoming idata
     * @returns new DELETE Command
     */
    static delete = <Ix extends object>(
        schema: Schematic<Ix>,
    ) => this.create('delete', schema, HttpMethod.Delete, '/')
        
    /**
     * Convience interface for defining a DELETE command named 'remove'
     * @param schema - validate incoming data
     * @returns new DELETE Command
     */
    static remove = <Ix extends object>(
        schema: Schematic<Ix>,
    ) => this.create('remove', schema, HttpMethod.Delete, '/')

    /**
     * Convience interface for defining a PATCH command named 'patch'
     * @param schema - validate incoming data
     * @returns new PATCH Command
     */
    static patch = <Ix extends object>(
        schema: Schematic<Ix>,
    ) => this.create('patch', schema, HttpMethod.Patch, '/')

    /**
     * Convience interface for defining a PATCH command named 'edit'
     * @param schema - validate incoming data
     * @returns new PATCH Command
     */
    static edit = <Ix extends object>(
        schema: Schematic<Ix>,
    ) => this.create('edit', schema, HttpMethod.Patch, '/')

    /**
     * Convience interface for defining a PUT command named 'update'
     * @param schema - validate incoming data
     * @returns new PUT Command
     */
    static update = <Ix extends object>(
        schema: Schematic<Ix>,
    ) => this.create('update', schema, HttpMethod.Put, '/')

    /**
     * Convience interface for defining a OPTIONS command named 'options'
     * @param schema - validate incoming data
     * @returns new OPTIONS Command
     */
    static options = <Ix extends object>(
        schema: Schematic<Ix>,
    ) => this.create('options', schema, HttpMethod.Options, '/')

    //// Sealed ////

    private constructor(
        name: N,
        protected readonly _schema: Schematic<I> | nil,
        hook: CommandHook<I, O>,
        protected readonly _reqHandler: Req<I>
    ) {
        super(name)
        this._execute = chain(hook)
    }

    protected readonly _execute: Chain<I,O> 

    protected override get _copyParams(): unknown[] {
        return [
            this.name,
            this._schema,
            this._execute,
            this._reqHandler
        ]
    }

    //// State ////
    
    get method(): HttpMethod {
        return this._reqHandler.method
    }

    override get methods(): [HttpMethod] {
        return [this.method]
    }

    //// Request Interface ////
    
    toRequest(input: I): Request {
        return this._reqHandler.toRequest(input)
    }

    matchRequest(req: Request): I | nil {
        return this._reqHandler.matchRequest(req)
    }

    //// Instance Build Interface ////

    /**
     * Add a hook to this command
     */
    useHook<Ox extends object>(hook: CommandHook<O, Ox> | Command<string, O, Ox>): Command<N, I, Ox> {

        const _hooks = '_execute' in hook 
            ? hook._execute 
            : hook

        return new Command(
            this.name,
            this._schema,
            this._execute.link(_hooks),
            this._reqHandler
        )
    }

    /**
     * Change the name of this command
     */
    useName<Nx extends string>(name: Nx): Command<Nx, I, O> {
        return new Command(
            name,
            this._schema,
            this._execute,
            this._reqHandler
        )
    }

    /**
     * Update or change the existing request handler for this command
     */
    useReq(update: (req: Req<I>) => Req<I>): Command<N, I, O>
    useReq(reqHandler: Req<I>): Command<N, I, O> 
    useReq(input: Req<I> | ((req: Req<I>) => Req<I>)): Command<N,I,O> {

        const reqHandler = is.function(input) 
            ? input(this._reqHandler) 
            : input

        return new Command(
            this.name,
            this._schema,
            this._execute,
            reqHandler.setSchema(this._schema)
        )
    }

    /**
     * Shortcut to useReq(req => req.useUrl)
     */
    useUrl(url: Path): Command<N,I,O>
    useUrl(urlSegments: TemplateStringsArray, ...urlParamKeys: UrlParamKeys<I>[]): Command<N,I,O>
    useUrl(...args: unknown[]): unknown {
        return this.useReq((r: any) => r.setUrl(...args))
    }
}

//// Exports ////

export default Command

export {
    Command,
    CommandInput,
    CommandOutput
}