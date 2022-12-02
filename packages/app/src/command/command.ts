import is from '@benzed/is'
import { pluck } from '@benzed/array'
import $, { SchemaFor, Schematic } from '@benzed/schema'
import { Chain, chain, Link, nil } from '@benzed/util'
import { toDashCase } from '@benzed/string'

import CommandModule from './command-module'

import { HttpMethod, Path, Request, RequestHandler as Req, UrlParamKeys } from '../util'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/explicit-function-return-type
*/

//// Types ////

type ShapeSchemaInput<T> = {
    [K in keyof T]: SchemaFor<T[K]>
}

type ValidateHook<T extends object> = Schematic<T> | ShapeSchemaInput<T>

/**
 * Command without build interface
 */
export type RuntimeCommand<I extends object> = 
    Omit<
    Command<string, I, object>,
    'useHook' | 'useName' | 'useReq' | 'useUrl' | 'useProvide'
    >

export type CommandHook<I extends object, O extends object> =
    ((this: RuntimeCommand<I>, input: I) => O) | Link<I, O>

type CommandInput<C> = C extends Command<any, infer I, any> ? I : unknown

type CommandOutput<C> = C extends Command<any, any, infer O> ? O : unknown

//// Types ////

const isSchematic = <T extends object>(input: unknown): input is ValidateHook<T> => 
    is.object<Partial<Schematic<T>>>(input) && 
    is.function(input.validate) && 
    is.function(input.assert) && 
    is.function(input.is)

const toSchematicAndValidate = <T extends object>(input: ValidateHook<T>): [Schematic<T>, Schematic<T>['validate']] => {
    const schematic = (isSchematic(input) ? input : $(input)) as Schematic<T>
    return [schematic, schematic.validate]
}

//// Command ////
class Command<N extends string, I extends object, O extends object> extends CommandModule<N, I, O> {

    //// Static Interface ////
    
    /**
     * Create a new generic command
     */
    static create<Nx extends string, Ix extends object, Ox extends object>(
        name: Nx,
        execute: CommandHook<Ix, Ox>,
        method?: HttpMethod,
        path?: Path
    ): Command<Nx, Ix, Ox>
    static create<Nx extends string, Ix extends object>(
        name: Nx,
        validate: ValidateHook<Ix>,
        method?: HttpMethod,
        path?: Path
    ): Command<Nx, Ix, Ix>

    /**
     * Convience method for defining a POST command named 'create'
     */
    static create<Ix extends object, Ox extends object>(
        execute: CommandHook<Ix, Ox>,
    ): Command<'create', Ix, Ox>
    static create<Ix extends object>(
        validate: ValidateHook<Ix>,
    ): Command<'create', Ix, Ix>

    static create(...args: unknown[]) {

        const isNamed = is.string(args[0])
        const [ cmdOrValidate ] = pluck(args, (i: unknown): i is ValidateHook<object> | CommandHook<object,object> =>
            is.function(i) || is.object(i)
        )

        const [schema, execute] = is.object(cmdOrValidate)
            ? toSchematicAndValidate(cmdOrValidate as ValidateHook<object>)
            : [nil, cmdOrValidate]
        
        const [
            name = 'create', 
            method = HttpMethod.Post, 
            path = name === 'create' ? '/' : `/${toDashCase(name)}`
        ] = (
            isNamed
                ? args
                : ['create', ...args]
        ) as [string | nil, HttpMethod | nil, Path | nil]

        return new Command(
            name, 
            schema, 
            execute, 
            Req.create(method).setUrl(path)
        )
    }

    /**
     * Create a new GET command named 'get'
     */
    static get<Ix extends object>(validate: ValidateHook<Ix>): Command<'get', Ix, Ix>
    static get<Ix extends object, Ox extends object>(execute: CommandHook<Ix,Ox>): Command<'get', Ix, Ox>
    static get(input: ValidateHook<object> | CommandHook<object,object>) {
        return this.create('get', input as ValidateHook<object>, HttpMethod.Get, '/') 
    }

    /**
     * Create a new GET command named 'find'
     */
    static find = <Ix extends object>(
        schema: ValidateHook<Ix>,
    ) => this.create('find', schema, HttpMethod.Get, '/')

    /**
     * Create a new DELETE command named 'delete'
     */
    static delete = <Ix extends object>(
        schema: ValidateHook<Ix>,
    ) => this.create('delete', schema, HttpMethod.Delete, '/')

    /**
     * Create a new DELETE command named 'remove'
     */
    static remove = <Ix extends object>(
        schema: ValidateHook<Ix>,
    ) => this.create('remove', schema, HttpMethod.Delete, '/')

    /**
     * Create a new PATCH command named 'patch'
     */
    static patch = <Ix extends object>(
        schema: ValidateHook<Ix>,
    ) => this.create('patch', schema, HttpMethod.Patch, '/')

    /**
     * Create a new PUT command named 'update'
     */
    static update = <Ix extends object>(
        schema: ValidateHook<Ix>,
    ) => this.create('update', schema, HttpMethod.Put, '/')

    /**
     * Create a new OPTIONS command named 'options'
     */
    static options = <Ix extends object>(
        schema: ValidateHook<Ix>,
    ) => this.create('options', schema, HttpMethod.Options, '/')

    //// Sealed ////

    private constructor(
        name: N,
        schema: Schematic<I> | nil,
        execute: CommandHook<I, O>,
        reqHandler: Req<I>
    ) {
        super(name)
        this._execute = chain(execute)
        this._schema = schema
        this._reqHandler = reqHandler.setSchema(schema)
    }

    protected readonly _schema: Schematic<I> | nil
    protected readonly _execute: Chain<I,O> 
    protected readonly _reqHandler: Req<I>

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

        const execute = '_execute' in hook
            ? hook.useValidate(nil)._execute
            : hook

        return new Command(
            this.name,
            this._schema,
            this._execute.link(execute),
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
            reqHandler
        )
    }

    /**
     * Shortcut to useReq(req => req.setUrl)
     */
    useUrl(urlSegments: TemplateStringsArray, ...urlParamKeys: UrlParamKeys<I>[]): Command<N,I,O> {
        return this.useReq(r => r.setUrl(urlSegments, ...urlParamKeys))
    }

    /**
     * Shortcut to useReq(req => req.setMethod)
     */
    useMethod(method: HttpMethod): Command<N, I, O> {
        return this.useReq(r => r.setMethod(method))
    }

    useValidate(validate: ValidateHook<I> | nil): Command<N, I, O> {

        const executeWithoutOldSchemaValidate = chain(
            ...this._execute
                .links
                .filter(link => link !== this._schema?.validate)
        ) as Chain<I,O>

        const [newSchematic] = validate ? toSchematicAndValidate(validate) : [nil]

        const newExecute = newSchematic 
            ? chain(newSchematic.validate).link(executeWithoutOldSchemaValidate)
            : executeWithoutOldSchemaValidate

        return new Command(
            this.name, 
            newSchematic, 
            newExecute, 
            this._reqHandler
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