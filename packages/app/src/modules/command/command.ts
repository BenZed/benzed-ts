import { pluck } from '@benzed/array'
import { ToAsync } from '@benzed/async'
import { Schematic } from '@benzed/schema'
import { toDashCase } from '@benzed/string'
import { Execute, ExecuteHook, Module, Node, path } from '@benzed/ecs'

import { 
    isObject,
    isFunc,  
    isString,

    nil
} from '@benzed/util'

import { 
    HttpMethod, 
    SchemaHook, 
    toSchematic, 
    UrlParamKeys,
    Request
} from '../../util'

import { RequestHandler } from '../request-handler'
import { AppModule } from '../../app-module'

/* eslint-disable 
    @typescript-eslint/explicit-function-return-type,
    @typescript-eslint/ban-types
*/

//// Type ////

type CommandContext = { user?: object }

type CommandHook<I,O> = ExecuteHook<I, O, CommandContext>

type CommandExecute<I,O> = Execute<I, O, CommandContext>

type CommandNode<H extends HttpMethod, I extends object, O extends object> = Node<[Command<H,I,O>, RequestHandler<I>, CommandExecute<I,O>], {}>

//// Helper ////

const toSchematicAndValidate = <T extends object>(input: SchemaHook<T>): [Schematic<T>, Schematic<T>['validate']] => {
    const schematic = toSchematic(input)
    return [schematic, schematic.validate]
}

//// Command ////

interface Command<H extends HttpMethod, I extends object, O extends object> extends Module<H> {

    get method(): H 
    get execute(): CommandExecute<I, O>
    get request(): RequestHandler<I>

}

//// CommandConstructor ////

interface CommandConstructor extends AppModule {

    create<H extends HttpMethod, Ix extends object, Ox extends object>(
        method: H,
        execute: CommandHook<Ix, Ox>,
        path?: path
    ): Command<H, Ix, Ox>

    create<H extends HttpMethod, Ix extends object>(
        method: H,
        schematic: SchemaHook<Ix>,
        path?: path
    ): Command<H, Ix, Ix>

    /**
     * Convience method for defining a POST command named HttpMethod.Post
     */
    create<I extends object, O extends object>(
        execute: CommandHook<I, O>,
    ): Command<HttpMethod.Post, I, O>
    create<I extends object>(
        schematic: SchemaHook<I>,
    ): Command<HttpMethod.Post, I, I>

    from<H extends HttpMethod, Ix extends object, Ox extends object>(
        request: RequestHandler<Ix>,
        execute: CommandExecute<Ix,Ox>
    ): Command<H,Ix,Ox>

    /**
     * Create a new POST command
     */
    post<I extends object, Ox extends object>(execute: CommandHook<I,Ox>): Command<HttpMethod.Post, I, Ox>
    post<I extends object>(validate: SchemaHook<I>): Command<HttpMethod.Post, I, I>

    /**
     * Create a new GET command 
     */
    get<I extends object, Ox extends object>(execute: CommandHook<I,Ox>): Command<HttpMethod.Get, I, Ox>
    get<I extends object>(validate: SchemaHook<I>): Command<HttpMethod.Get, I, I>

    /**
     * Create a new DELETE commanD
     */
    delete<I extends object, Ox extends object>(execute: CommandHook<I,Ox>): Command<HttpMethod.Delete, I, Ox>
    delete<I extends object>(validate: SchemaHook<I>): Command<HttpMethod.Delete, I, I>

    /**
     * Create a new PATCH command
     */
    patch<I extends object, Ox extends object>(execute: CommandHook<I,Ox>): Command<HttpMethod.Patch, I, Ox>
    patch<I extends object>(validate: SchemaHook<I>): Command<HttpMethod.Patch, I, I>

    /**
     * Create a new PUT command
     */
    put<I extends object, Ox extends object>(execute: CommandHook<I,Ox>): Command<HttpMethod.Put, I, Ox>
    put<I extends object>(validate: SchemaHook<I>): Command<HttpMethod.Put, I, I>

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
                name = HttpMethod.Post, 
                method = HttpMethod.Post, 
                url = name === HttpMethod.Post ? '/' : `/${toDashCase(name)}`
            ] = (
                isNamed
                    ? args
                    : [HttpMethod.Post, ...args]
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

        static post(input: SchemaHook<object> | CommandHook<object,object>) {
            return this.create(HttpMethod.Get, input, HttpMethod.Get, '/') 
        }

        static get(input: SchemaHook<object> | CommandHook<object,object>) {
            return this.create(HttpMethod.Get, input, HttpMethod.Get, '/') 
        }

        static delete(input: SchemaHook<object> | CommandHook<object,object>) {
            return this.create(HttpMethod.Delete, input, HttpMethod.Delete, '/')
        }

        static patch(input: SchemaHook<object> | CommandHook<object,object>) {
            return this.create(HttpMethod.Patch, input, HttpMethod.Patch, '/')
        }

        static put(input: SchemaHook<object> | CommandHook<object,object>) {
            return this.create(HttpMethod.Put, input, HttpMethod.Put, '/')
        }

        static options(input: SchemaHook<object> | CommandHook<object,object>) {
            return this.create(HttpMethod.Options, input, HttpMethod.Options, '/')
        }

        //// Sealed ////

        override get name(): string {
            const [ path ] = this.modules
            return path.path.replace('/', '')
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