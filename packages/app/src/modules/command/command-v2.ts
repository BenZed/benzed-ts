import { pluck } from '@benzed/array'
import { ToAsync } from '@benzed/async'
import { Schematic } from '@benzed/schema'
import { toDashCase } from '@benzed/string'
import { Execute, ExecuteHook, Modules, path } from '@benzed/ecs'

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

import { Name } from './name'

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
> extends Modules<[Name<N>, RequestHandler<I>, CommandExecute<I,O>]> {

    (input: I): ToAsync<O>

    get name(): N

    /**
     * Change the name of this command
     */
    setName<Nx extends string>(name: Nx): Command<Nx, I, O>

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

interface CommandConstructor {

    /**
     * Create a new generic command
     */
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
        name: Name<Nx>,
        request: RequestHandler<Ix>,
        execute: CommandExecute<Ix,Ox>
    ): Command<Nx,Ix,Ox>

}

//// Command ////

const Command = callable(

    function execute(input: object): object {
        const executor = this.modules[2]
        const output = executor(input, {})
        return Promise.resolve(output)
    },

    class _Command extends Modules<[Name<string>, RequestHandler<object>, CommandExecute<object,object>]> {
        
        static from(...args: [Name<string>, RequestHandler<object>, CommandExecute<object,object>]): unknown {
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
                new Name(name),

                RequestHandler
                    .create(method)
                    .setUrl(url)
                    .setSchema(schema),

                new Execute(execute as CommandHook<object,ToAsync<object>>) 
            )
        } 

        //// Sealed ////

        override get name(): string {
            return this.modules[0].getName()
        }

        //// Name Shortcuts ////

        setName(name: string): unknown {
            const [, handler, execute] = this.modules
            return _Command.from(
                new Name(name),
                handler,
                execute
            )
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
    Command
}