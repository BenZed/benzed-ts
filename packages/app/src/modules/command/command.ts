import { pluck } from '@benzed/array'
import { ToAsync } from '@benzed/async'
import { Schematic } from '@benzed/schema'
import { toDashCase } from '@benzed/string'
import { Execute, ExecuteHook, Modules, Path, path } from '@benzed/ecs'

import { 
    nil,
    isObject,
    isFunc,  
    isString,
    ResolveAsyncOutput,
    callable
} from '@benzed/util'

import { 
    HttpMethod, 
    SchemaHook, 
    toSchematic, 
    UrlParamKeys,
    Request
} from '../../util'

import { RequestHandler } from '../request-handler'

/* eslint-disable 
    @typescript-eslint/explicit-function-return-type
*/

//// Type ////

type CommandContext = {
    user?: object
}

type CommandHook<I,O> = ExecuteHook<I, O, CommandContext>

type CommandExecute<I,O> = Execute<I, O, CommandContext>

//// Helper ////

const toSchematicAndValidate = <T extends object>(input: SchemaHook<T>): [Schematic<T>, Schematic<T>['validate']] => {
    const schematic = toSchematic(input)
    return [schematic, schematic.validate]
}

//// Command ////

interface Command<
    N extends string, 
    I extends object, 
    O extends object
> extends Modules<[Path<`/${N}`>, RequestHandler<I>, CommandExecute<I,O>]> {

    (input: I): ToAsync<O>

    get name(): N

    /**
     * Change the name of this command
     */
    setName<Nx extends string>(name: Nx): Command<Nx, I, O>

    getPath(): `/${N}`
    getPathFromRoot(): path

    //// Request Shortcuts ////

    /**
     * Update or change the existing request handler for this command
     */
    setReq(update: (req: RequestHandler<I>) => RequestHandler<I>): Command<N, I, O>
    setReq(req: RequestHandler<I>): Command<N, I, O> 

    /**
     * Shortcut to useReq(req => req.setUrl)
     */
    setUrl(
        urlSegments: TemplateStringsArray, 
        ...urlParamKeys: UrlParamKeys<I>[]
    ): Command<N,I,O>

    /**
     * Shortcut to useReq(req => req.setMethod)
     */
    setHttpMethod(method: HttpMethod): Command<N, I, O> 
    get httpMethod(): HttpMethod 
    reqFromData(data: I): Request
    reqMatch(req: Request): I | nil 

    //// Execute Shortcuts ////

    appendHook<Ox extends object>(hook: CommandHook<Awaited<O>, Ox>): Command<N, I, ResolveAsyncOutput<O, Ox>>
    prependHook<Ix extends object>(hook: CommandHook<Awaited<Ix>, I>): Command<N, Ix, O> 
}

//// CommandConstructor ////

type ModulesConstructor = typeof Modules

interface CommandConstructor extends ModulesConstructor {

    create<Nx extends string, Ix extends object, Ox extends object>(
        name: Nx,
        execute: CommandHook<Ix, Ox>,
        method?: HttpMethod,
        path?: path
    ): Command<Nx, Ix, Ox>

    create<Nx extends string, Ix extends object>(
        name: Nx,
        schematic: SchemaHook<Ix>,
        method?: HttpMethod,
        path?: path
    ): Command<Nx, Ix, Ix>

    /**
     * Convience method for defining a POST command named 'create'
     */
    create<Ix extends object, Ox extends object>(
        execute: CommandHook<Ix, Ox>,
    ): Command<'create', Ix, Ox>
    create<Ix extends object>(
        schematic: SchemaHook<Ix>,
    ): Command<'create', Ix, Ix>

    from<Nx extends string, Ix extends object, Ox extends object>(
        path: Path<`/${Nx}`>,
        request: RequestHandler<Ix>,
        execute: CommandExecute<Ix,Ox>
    ): Command<Nx,Ix,Ox>

    /**
     * Create a new GET command named 'get'
     */
    get<Ix extends object, Ox extends object>(execute: CommandHook<Ix,Ox>): Command<'get', Ix, Ox>
    get<Ix extends object>(validate: SchemaHook<Ix>): Command<'get', Ix, Ix>

    /**
     * Create a new GET command named 'find'
     */
    find<Ix extends object, Ox extends object>(execute: CommandHook<Ix,Ox>): Command<'find', Ix, Ox>
    find<Ix extends object>(validate: SchemaHook<Ix>): Command<'find', Ix, Ix>

    /**
     * Create a new DELETE command named 'delete'
     */
    delete<Ix extends object, Ox extends object>(execute: CommandHook<Ix,Ox>): Command<'delete', Ix, Ox>
    delete<Ix extends object>(validate: SchemaHook<Ix>): Command<'delete', Ix, Ix>

    /**
     * Create a new DELETE command named 'remove'
     */
    remove<Ix extends object, Ox extends object>(execute: CommandHook<Ix,Ox>): Command<'remove', Ix, Ox>
    remove<Ix extends object>(validate: SchemaHook<Ix>): Command<'remove', Ix, Ix>

    /**
     * Create a new PATCH command named 'patch'
     */
    patch<Ix extends object, Ox extends object>(execute: CommandHook<Ix,Ox>): Command<'patch', Ix, Ox>
    patch<Ix extends object>(validate: SchemaHook<Ix>): Command<'patch', Ix, Ix>

    /**
     * Create a new PUT command named 'update'
     */
    update<Ix extends object, Ox extends object>(execute: CommandHook<Ix,Ox>): Command<'update', Ix, Ox>
    update<Ix extends object>(validate: SchemaHook<Ix>): Command<'update', Ix, Ix>

    /**
     * Create a new OPTIONS command named 'options'
     */
    options<Ix extends object, Ox extends object>(execute: CommandHook<Ix,Ox>): Command<'options', Ix, Ox>
    options<Ix extends object>(validate: SchemaHook<Ix>): Command<'options', Ix, Ix>
}

//// Command ////

const Command = callable(

    function execute(input: object): object {
        const executor = this.modules[2]
        const output = executor(input, {})
        return Promise.resolve(output)
    },

    class _Command extends Modules<[Path<path>, RequestHandler<object>, CommandExecute<object,object>]> {
        
        static from(...args: [Path<path>, RequestHandler<object>, CommandExecute<object,object>]): unknown {
            return new (Command as unknown as new (...args: unknown[]) => unknown)(...args)
        }

        static create(...args: unknown[]): unknown {

            const isNamed = isString(args[0])
            const [ cmdOrValidate ] = pluck(args, (i: unknown): i is SchemaHook<object> | CommandHook<object,object> =>
                isFunc(i) || isObject(i)
            )

            const [
                schema, 
                execute
            ] = isObject(cmdOrValidate)
                ? toSchematicAndValidate(cmdOrValidate as SchemaHook<object>)
                : [nil, cmdOrValidate]
        
            const [
                name = 'create', 
                method = HttpMethod.Post, 
                url = name === 'create' ? '/' : `/${toDashCase(name)}`
            ] = (
                isNamed
                    ? args
                    : ['create', ...args]
            ) as [string | nil, HttpMethod | nil, path | nil]

            return _Command.from(
                new Path(`/${name}`),

                RequestHandler
                    .create(method)
                    .setUrl(url)
                    .setSchema(schema),

                new Execute(execute as CommandHook<object,ToAsync<object>>) 
            )
        } 

        static get(input: SchemaHook<object> | CommandHook<object,object>) {
            return this.create('get', input, HttpMethod.Get, '/') 
        }

        static find(input: SchemaHook<object> | CommandHook<object,object>) {
            return this.create('find', input, HttpMethod.Get, '/')
        }

        static delete(input: SchemaHook<object> | CommandHook<object,object>) {
            return this.create('delete', input, HttpMethod.Delete, '/')
        }

        static remove(input: SchemaHook<object> | CommandHook<object,object>) {
            return this.create('remove', input, HttpMethod.Delete, '/')
        }

        static patch(input: SchemaHook<object> | CommandHook<object,object>) {
            return this.create('patch', input, HttpMethod.Patch, '/')
        }

        static update(input: SchemaHook<object> | CommandHook<object,object>) {
            return this.create('update', input, HttpMethod.Put, '/')
        }

        static options(input: SchemaHook<object> | CommandHook<object,object>) {
            return this.create('options', input, HttpMethod.Options, '/')
        }

        //// Sealed ////

        override get name(): string {
            const [ path ] = this.modules
            return path.path.replace('/', '')
        }

        //// Name/Path Shortcuts ////

        setName(name: string): unknown {
            const [, handler, execute] = this.modules
            return _Command.from(
                new Path(`/${name}`),
                handler,
                execute
            )
        }

        getPath(): path {
            const [ path ] = this.modules
            return path.path
        }

        getPathFromRoot(): path {
            const [ path ] = this.modules
            return path.getPathFromRoot()
        }

        //// Request Shortcuts ////

        setReq(input: RequestHandler<object> | ((req: RequestHandler<object>) => RequestHandler<object>)): unknown {

            const [name, oldHandler, execute] = this.modules
            const newHandler = 'parent' in input
                ? input
                : input(oldHandler) 

            return _Command.from(
                name, 
                newHandler,
                execute
            )
        }

        /**
         * Shortcut to useReq(req => req.setUrl)
         */
        setUrl(
            urlSegments: TemplateStringsArray, 
            ...urlParamKeys: UrlParamKeys<object>[]
        ): unknown {
            return this.setReq(r => r.setUrl(urlSegments, ...urlParamKeys))
        }
    
        /**
         * Shortcut to useReq(req => req.setMethod)
         */
        setHttpMethod(method: HttpMethod): unknown {
            return this.setReq(r => r.setMethod(method))
        }
        
        get httpMethod(): HttpMethod {
            return this.modules[1].method
        }

        reqFromData(data: object): Request {
            return this.modules[1].fromData(data)
        }

        reqMatch(req: Request): object | nil {
            return this.modules[1].match(req)
        }
    
        appendHook(hook: CommandHook<object,object>): unknown {
            const [name, handler, execute] = this.modules
            return _Command.from(name, handler, execute.append(hook))
        }

        prependHook(hook: CommandHook<object,object>): unknown {
            const [name, handler, execute] = this.modules
            return _Command.from(name, handler, execute.prepend(hook))
        }

    },
    'Command'
) as CommandConstructor

//// Exports ////

export default Command

export {
    Command,
    CommandContext,
    CommandHook
}