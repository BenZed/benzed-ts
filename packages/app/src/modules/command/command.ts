import { pluck } from '@benzed/array'
import { toDashCase } from '@benzed/string'
import { Schematic } from '@benzed/schema'
import { 
    nil,

    isObject,
    isFunc,  
    isString,
     
    Transform, 

    Pipe, 
    BoundPipe,
    ContextTransform
} from '@benzed/util'

import CommandModule from './command-v2'

import { 
    HttpMethod, 
    Path, 
    SchemaHook, 
    toSchematic, 
    UrlParamKeys 
} from '../../util'
import { RequestHandler } from '../request-handler'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/explicit-function-return-type
*/

//// Types ////

/**
 * Command without build interface
 */
export type RuntimeCommand<I extends object> = {
    [K in keyof Command<string, I, any> as K extends `use${string}` ? never : K]: Command<string,I,any>[K]
}

export type CommandHook<I extends object, O extends object> = 
    ContextTransform<I, O | Promise<O>, RuntimeCommand<I>> |
    Transform<I, O | Promise<O>>

type CommandInput<C> = C extends Command<any, infer I, any> ? I : unknown

type CommandOutput<C> = C extends Command<any, any, infer O> ? O : unknown

//// Types ////

const toSchematicAndValidate = <T extends object>(input: SchemaHook<T>): [Schematic<T>, Schematic<T>['validate']] => {
    const schematic = toSchematic(input)
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
        schematic: SchemaHook<Ix>,
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
        schematic: SchemaHook<Ix>,
    ): Command<'create', Ix, Ix>

    static create(...args: unknown[]) {

        const isNamed = isString(args[0])
        const [ cmdOrValidate ] = pluck(args, (i: unknown): i is SchemaHook<object> | CommandHook<object,object> =>
            isFunc(i) || isObject(i)
        )

        const [schema, execute] = isObject(cmdOrValidate)
            ? toSchematicAndValidate(cmdOrValidate as SchemaHook<object>)
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
            execute, 
            RequestHandler
                .create(method)
                .setUrl(path)
                .setSchema(schema)
        )
    }

    /**
     * Create a new GET command named 'get'
     */
    static get<Ix extends object, Ox extends object>(execute: CommandHook<Ix,Ox>): Command<'get', Ix, Ox>
    static get<Ix extends object>(validate: SchemaHook<Ix>): Command<'get', Ix, Ix>
    static get(input: SchemaHook<object> | CommandHook<object,object>) {
        return this.create('get', input, HttpMethod.Get, '/') 
    }

    /**
     * Create a new GET command named 'find'
     */
    static find<Ix extends object, Ox extends object>(execute: CommandHook<Ix,Ox>): Command<'find', Ix, Ox>
    static find<Ix extends object>(validate: SchemaHook<Ix>): Command<'find', Ix, Ix>
    static find(input: SchemaHook<object> | CommandHook<object,object>) {
        return this.create('find', input, HttpMethod.Get, '/')
    }

    /**
     * Create a new DELETE command named 'delete'
     */
    static delete<Ix extends object, Ox extends object>(execute: CommandHook<Ix,Ox>): Command<'delete', Ix, Ox>
    static delete<Ix extends object>(validate: SchemaHook<Ix>): Command<'delete', Ix, Ix>
    static delete(input: SchemaHook<object> | CommandHook<object,object>) {
        return this.create('delete', input, HttpMethod.Delete, '/')
    }

    /**
     * Create a new DELETE command named 'remove'
     */
    static remove<Ix extends object, Ox extends object>(execute: CommandHook<Ix,Ox>): Command<'remove', Ix, Ox>
    static remove<Ix extends object>(validate: SchemaHook<Ix>): Command<'remove', Ix, Ix>
    static remove(input: SchemaHook<object> | CommandHook<object,object>) {
        return this.create('remove', input, HttpMethod.Delete, '/')
    }

    /**
     * Create a new PATCH command named 'patch'
     */
    static patch<Ix extends object, Ox extends object>(execute: CommandHook<Ix,Ox>): Command<'patch', Ix, Ox>
    static patch<Ix extends object>(validate: SchemaHook<Ix>): Command<'patch', Ix, Ix>
    static patch(input: SchemaHook<object> | CommandHook<object,object>) {
        return this.create('patch', input, HttpMethod.Patch, '/')
    }

    /**
     * Create a new PUT command named 'update'
     */
    static update<Ix extends object, Ox extends object>(execute: CommandHook<Ix,Ox>): Command<'update', Ix, Ox>
    static update<Ix extends object>(validate: SchemaHook<Ix>): Command<'update', Ix, Ix>
    static update(input: SchemaHook<object> | CommandHook<object,object>) {
        return this.create('update', input, HttpMethod.Put, '/')
    }

    /**
     * Create a new OPTIONS command named 'options'
     */
    static options<Ix extends object, Ox extends object>(execute: CommandHook<Ix,Ox>): Command<'options', Ix, Ox>
    static options<Ix extends object>(validate: SchemaHook<Ix>): Command<'options', Ix, Ix>
    static options(input: SchemaHook<object> | CommandHook<object,object>) {
        return this.create('options', input, HttpMethod.Options, '/')
    }

    //// Sealed ////

    override get name() {
        return this._name
    }

    private constructor(
        name: N,
        execute: Transform<I,O>,
        handler: RequestHandler<I>
    ) {
        super(name, handler)
        this._executeOnServer = Pipe.from(execute).bind(this)
    }

    protected readonly _executeOnServer: BoundPipe<I, O, this>

    protected override get _copyParams(): unknown[] {
        return [
            this._name,
            this._executeOnServer,
            this.request
        ]
    }

    //// Instance Build Interface ////

    /**
     * Append a hook to this command
     */
    useHook<Ox extends object = O>(
        hook: ContextTransform<O, Ox, this>
    ): Command<N, I, Ox>

    useHook<Ox extends object = O>(
        hook: Transform<O, Ox>
    ): Command<N, I, Ox> 
    
    useHook<Ox extends object = O>(
        hook: Transform<O, Ox> | ContextTransform<O, Ox, this>   
    ){
        return this._useHook(hook as Transform<O, Ox>, false)
    }

    /**
     * Prepend a hook to this command
     */
    usePreHook<Ix extends object = O>(
        hook: ContextTransform<Ix, I, this>
    ): Command<N, Ix, O>

    usePreHook<Ix extends object = O>(
        hook: Transform<Ix, I>
    ): Command<N, Ix, O> 

    usePreHook<Ix extends object = O>(
        hook: Transform<Ix, I> | ContextTransform<Ix, I, this>  
    ): Command<N, Ix, O> {
        return this._useHook(hook as Transform<Ix, I>, true)
    }
    
    /**
     * Change the name of this command
     */
    setName<Nx extends string>(name: Nx): Command<Nx, I, O> {
        return new Command(
            name,
            this._executeOnServer,
            this.request
        )
    }

    /**
     * Update or change the existing request handler for this command
     */
    setReq(update: (req: RequestHandler<I>) => RequestHandler<I>): Command<N, I, O>
    setReq(reqHandler: RequestHandler<I>): Command<N, I, O> 
    setReq(input: RequestHandler<I> | ((req: RequestHandler<I>) => RequestHandler<I>)): Command<N,I,O> {

        const handler = isFunc(input) 
            ? input(this.request) 
            : input

        return new Command(
            this._name,
            this._executeOnServer,
            handler
        )
    }

    /**
     * Shortcut to useReq(req => req.setUrl)
     */
    setUrl(urlSegments: TemplateStringsArray, ...urlParamKeys: UrlParamKeys<I>[]): Command<N,I,O> {
        return this.setReq(r => r.setUrl(urlSegments, ...urlParamKeys))
    }

    /**
     * Shortcut to useReq(req => req.setMethod)
     */
    setHttpMethod(method: HttpMethod): Command<N, I, O> {
        return this.setReq(r => r.setMethod(method))
    }

    setValidate(validate: SchemaHook<I> | nil): Command<N, I, O> {

        const executeWithoutOldSchemaValidate = Pipe.from(
            ...this._executeOnServer
                .transforms
                .filter(link => link !== this.request.schema?.validate)
        ) as Transform<I,O>

        const [newSchematic] = validate ? toSchematicAndValidate(validate) : [nil]

        const newExecute = newSchematic 
            ? Pipe
                .from(newSchematic.validate)
                .to(executeWithoutOldSchemaValidate)
            : executeWithoutOldSchemaValidate

        return new Command(
            this._name, 
            newExecute, 
            this.request.setSchema(newSchematic)
        )
    }

    //// Helper ////
    
    private _useHook(hook: CommandHook<any, any> | Command<string, any, any>, prepend: boolean): Command<N, any, any> {
        const oldExecute = this._executeOnServer

        const newExecute = 'execute' in hook
            ? hook.useValidate(nil)._executeOnServer
            : hook

        const execute = prepend 
            ? Pipe.from(newExecute).to(oldExecute) 
            : Pipe.from(oldExecute).to(newExecute)

        return new Command(
            this._name,
            execute as BoundPipe<I, O, this>,
            this.request
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