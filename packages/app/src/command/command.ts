import { pluck } from '@benzed/array'
import $, { SchemaFor, Schematic } from '@benzed/schema'
import { Pipe, Transform, isObject, isFunc, nil, isString } from '@benzed/util'
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
    ((this: RuntimeCommand<I>, input: I) => O) | Transform<I, O>

type CommandInput<C> = C extends Command<any, infer I, any> ? I : unknown

type CommandOutput<C> = C extends Command<any, any, infer O> ? O : unknown

//// Types ////

const isSchematic = <T extends object>(input: unknown): input is ValidateHook<T> => 
    isObject<Partial<Schematic<T>>>(input) && 
    isFunc(input.validate) && 
    isFunc(input.assert) && 
    isFunc(input.is)

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

        const isNamed = isString(args[0])
        const [ cmdOrValidate ] = pluck(args, (i: unknown): i is ValidateHook<object> | CommandHook<object,object> =>
            isFunc(i) || isObject(i)
        )

        const [schema, execute] = isObject(cmdOrValidate)
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
    static get<Ix extends object, Ox extends object>(execute: CommandHook<Ix,Ox>): Command<'get', Ix, Ox>
    static get<Ix extends object>(validate: ValidateHook<Ix>): Command<'get', Ix, Ix>
    static get(input: ValidateHook<object> | CommandHook<object,object>) {
        return this.create('get', input as ValidateHook<object>, HttpMethod.Get, '/') 
    }

    /**
     * Create a new GET command named 'find'
     */
    static find<Ix extends object, Ox extends object>(execute: CommandHook<Ix,Ox>): Command<'find', Ix, Ox>
    static find<Ix extends object>(validate: ValidateHook<Ix>): Command<'find', Ix, Ix>
    static find(input: ValidateHook<object> | CommandHook<object,object>) {
        return this.create('find', input, HttpMethod.Get, '/')
    }

    /**
     * Create a new DELETE command named 'delete'
     */
    static delete<Ix extends object, Ox extends object>(execute: CommandHook<Ix,Ox>): Command<'delete', Ix, Ox>
    static delete<Ix extends object>(validate: ValidateHook<Ix>): Command<'delete', Ix, Ix>
    static delete(input: ValidateHook<object> | CommandHook<object,object>) {
        return this.create('delete', input, HttpMethod.Delete, '/')
    }

    /**
     * Create a new DELETE command named 'remove'
     */
    static remove<Ix extends object, Ox extends object>(execute: CommandHook<Ix,Ox>): Command<'remove', Ix, Ox>
    static remove<Ix extends object>(validate: ValidateHook<Ix>): Command<'remove', Ix, Ix>
    static remove(input: ValidateHook<object> | CommandHook<object,object>) {
        return this.create('remove', input, HttpMethod.Delete, '/')
    }

    /**
     * Create a new PATCH command named 'patch'
     */
    static patch<Ix extends object, Ox extends object>(execute: CommandHook<Ix,Ox>): Command<'patch', Ix, Ox>
    static patch<Ix extends object>(validate: ValidateHook<Ix>): Command<'patch', Ix, Ix>
    static patch(input: ValidateHook<object> | CommandHook<object,object>) {
        return this.create('patch', input, HttpMethod.Patch, '/')
    }

    /**
     * Create a new PUT command named 'update'
     */
    static update<Ix extends object, Ox extends object>(execute: CommandHook<Ix,Ox>): Command<'update', Ix, Ox>
    static update<Ix extends object>(validate: ValidateHook<Ix>): Command<'update', Ix, Ix>
    static update(input: ValidateHook<object> | CommandHook<object,object>) {
        return this.create('update', input, HttpMethod.Put, '/')
    }

    /**
     * Create a new OPTIONS command named 'options'
     */
    static options<Ix extends object, Ox extends object>(execute: CommandHook<Ix,Ox>): Command<'options', Ix, Ox>
    static options<Ix extends object>(validate: ValidateHook<Ix>): Command<'options', Ix, Ix>
    static options(input: ValidateHook<object> | CommandHook<object,object>) {
        return this.create('options', input, HttpMethod.Options, '/')
    }

    //// Sealed ////

    private constructor(
        name: N,
        schema: Schematic<I> | nil,
        execute: CommandHook<I, O>,
        reqHandler: Req<I>
    ) {
        super(name)
        this._execute = Pipe.from(execute)
        this._schema = schema
        this._reqHandler = reqHandler.setSchema(schema)
    }

    protected readonly _schema: Schematic<I> | nil
    protected readonly _execute: Pipe<I,O> 
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
    useHook<Ox extends object = O>(hook: CommandHook<O, Ox> | Command<string, O, Ox>): Command<N, I, Ox> {
        return this._useHook(hook, false)
    }

    /**
     * Prepend a hook to this command
     */
    usePreHook<Ix extends object = O>(hook: CommandHook<Ix, I> | Command<string, Ix, I>): Command<N, Ix, O> {
        return this._useHook(hook, true)
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

        const reqHandler = isFunc(input) 
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

        const executeWithoutOldSchemaValidate = Pipe.from(
            ...this._execute
                .transforms
                .filter(link => link !== this._schema?.validate)
        ) as Transform<I,O>

        const [newSchematic] = validate ? toSchematicAndValidate(validate) : [nil]

        const newExecute = newSchematic 
            ? Pipe.from(newSchematic.validate).to(executeWithoutOldSchemaValidate)
            : executeWithoutOldSchemaValidate

        return new Command(
            this.name, 
            newSchematic, 
            newExecute, 
            this._reqHandler
        )
    }

    //// Helper ////
    
    private _useHook(hook: CommandHook<any, any> | Command<string, any, any>, prepend: boolean): Command<N, any, any> {
        const oldExecute = this._execute

        const newExecute = '_execute' in hook
            ? hook.useValidate(nil)._execute
            : hook

        return new Command(
            this.name,
            this._schema,
            prepend ? Pipe.from(newExecute).to(oldExecute) : Pipe.from(oldExecute).to(newExecute),
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