import is from '@benzed/is'
import $ from '@benzed/schema'
import { pluck } from '@benzed/array'
import { toDashCase } from '@benzed/string'
import { Chain, chain, Link } from '@benzed/util'

import CommandModule from './command-module'

import { HttpMethod, Path } from '../util'

import { /* Auth,*/ toDatabase, ToDatabaseOutput } from '../modules'

import { createFromReq, createToReq, Request, FromRequest, ToRequest, StringFields, } from './request'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/explicit-function-return-type
*/

////  ////

const $dashCase = $.string.validates(
    x => '/' + toDashCase(x.replace('/', '')),
    p => `path "${p}" must be in dash-case`
)

//// Types ////

/**
 * Command without build interface
 */
export type RuntimeCommand<I extends object> = 
    Omit<Command<string, I, object>, 'useHook' | 'useDatabase'>

// type CommandHookTypeGuard<I extends object, O extends I, N extends string> = 
//     ((this: RuntimeCommand<N, I>, input: I) => input is O) | TypeGuard<O, I>

// export type CommandHookPredicate<I extends object, N extends string> = 
//     ((this: RuntimeCommand<N,I>, input: I) => boolean) | Link<I, boolean>

export type CommandHook<I extends object, O extends object> =
    ((this: RuntimeCommand<I>, input: I) => O) | Link<I, O> 

type CommandValidate<I extends object> = { validate: Link<I, I> }

type CommandInput<C> = C extends Command<any, infer I, any> ? I : unknown
type CommandOutput<C> = C extends Command<any, any, infer O> ? O : unknown

//// Command ////
class Command<N extends string, I extends object, O extends object> extends CommandModule<N, I, O> {

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

        const isNamed = is.string(args[0])

        const [
            { validate }
        ] = pluck(args, (i): i is CommandValidate<object> => is.object(i))

        const [
            name = 'create', 
            method = HttpMethod.Post, 
            path = name === 'create' ? '/' : `/${toDashCase(name)}`

        ] = (isNamed
            ? args
            : ['create', ...args]) as [string | undefined, HttpMethod | undefined, Path | undefined]

        return new Command(name, validate, { method, path })
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
        http: {
            method: HttpMethod
            path: Path
            to?: ToRequest<I, StringFields<I>>
            from?: FromRequest<I, StringFields<I>>
        }
    ) {

        super(name)

        const { method, path, to, from } = http

        void $dashCase.assert(path)

        this.method = method
        this.path = path
        this.toRequest = to ?? createToReq(method, `${this.pathFromRoot}/${this.path}`)
        this.fromRequest = from ?? createFromReq(method, `${this.pathFromRoot}/${this.path}`)

        this._execute = chain(hookOrValidate)
    }

    protected readonly _execute: Chain<I,O> 

    protected override get _copyParams(): unknown[] {

        const { method, path, toRequest, fromRequest } = this

        return [
            this.name,
            this._execute,
            {
                method,
                path,
                toRequest,
                fromRequest
            }
        ]
    }

    //// State ////
    
    readonly method: HttpMethod

    readonly path: Path 

    override get methods(): [HttpMethod] {
        return [this.method]
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
    
    readonly toRequest: ToRequest<I, any>

    readonly fromRequest: FromRequest<I, any>

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

        const { name, method, path, toRequest, fromRequest } = this

        return new Command(
            name,
            this._execute.link(hook),
            {
                method,
                path,
                to: toRequest,
                from: fromRequest
            }
        )
    }

    /**
     * Sends the current output to the database. Operation is
     * inferred from http.method.
     * 
     * Collection name can be provied, or it default to constructing
     * a collection name from the service path.
     */
    useDatabase(collection?: string): Command<N, I, ToDatabaseOutput<I, O>> {

        return this.useHook(
            toDatabase<I,O>(
                this.method, 
                collection
            )
        )
    }

    useRequest(options: {
        from: FromRequest<I, any>
        to: ToRequest<I, any>
        method?: HttpMethod
        path?: Path
    }) {

        const { name, _execute: execute, method, path } = this

        return new Command(
            name,
            execute,
            {
                ...options,
                method,
                path
            }
        )
    }

    useAuth(): Command<N, I & { accessToken?: string }, Promise<O & { user: object }>> {

        const { name, method, path, toRequest, fromRequest } = this

        type AuthCommand = Command<N, I & { accessToken?: string }, Promise<O & { user: object }>> 

        return new Command(
            
            name,

            function (
                this: AuthCommand, 
                input: I & { accessToken?: string }
            ): Promise<O & { user: object }> {
    
                const { accessToken = '' } = input
    
                // const auth = this.getModule(Auth, true, 'parents')
                // const user = await auth.verifyAccessToken(accessToken)
                // const output = await (this._execute(input) as O | Promise<O>)
    
                return {
                    // ...output,
                    // user
                } as any
            },

            {

                method,

                path,

                to: chain(toRequest).link(function(
                    this: AuthCommand, 
                    [method, url, data, headers],
                ): Request<I> {

                    // const { accessToken = '' } = this.getModule(Auth, true, 'parents')
                    // if (accessToken) {
                    //     headers = headers ?? new Headers()
                    //     headers.set('authorization', `Bearer ${accessToken}`)
                    // }

                    return [
                        method, url, data, headers
                    ]
                }),

                from: function(
                    this: AuthCommand, 
                    [method, url, data, headers]: Request<object, never>
                ): I & { accessToken: string } | null {

                    const output = fromRequest([method, url, data, headers]) as I | null
                    if (!output)
                        return null

                    const accessToken = headers
                        ?.get('authorization')
                        ?.replace('Bearer ', '') ?? ''

                    return { ...output, accessToken }
                }
            }
        )
    }
}

//// Exports ////

export default Command

export {
    Command,
    CommandInput,
    CommandOutput
}