import { callable, isFunc, Pipe, through } from '@benzed/util'
import { Async, ToAsync, FromAsync, toAsync } from '@benzed/async'
import { Module, Execute, ExecuteHook, Node, Nodes } from '@benzed/ecs'
import { Schematic } from '@benzed/schema'
import { copy } from '@benzed/immutable'
import { pluck } from '@benzed/array'

import { RequestHandler } from '../request-handler'
import commandList from './command-list'

import {
    HttpMethod,
    SchemaHook,
    toSchematic,
    Json
} from '../../util'

/* eslint-disable 
    @typescript-eslint/ban-types
*/
 
//// Types ////

interface Provide {}

interface Hook< 
    I extends Json = Json, 
    O extends Json | Async<Json> = Json,
    C extends Provide = Provide
> extends ExecuteHook<I, O, C> {}

interface Command<
    I extends Json = Json, 
    O extends Json = Json, 
    C extends Provide = Provide
> 
    extends Node<[RequestHandler<I>, Execute<I, ToAsync<O>, C>], {}> {

    (input: I): Async<O>

    get req(): RequestHandler<I>
    setReq(
        reqOrUpdate: RequestHandler<I> | ((req: RequestHandler<I>) => RequestHandler<I>)
    ): Command<I, O, C>
    
    get method(): HttpMethod
    setMethod(method: HttpMethod): Command<I, O, C>
    
    get schema(): Schematic<I> 
    setSchema(schema: SchemaHook<I>): Command<I, O, C>

    get execute(): Execute<I, O, C>

    appendHook<Ox extends Json>(
        hook: Hook<O, Ox | Async<Ox>, C>
    ): Command<I, Ox, C>

    prependHook(hook: Hook<I, I | Async<I>, C>): Command<I, O, C>

    prependHook<Ix extends Json>(
        schema: SchemaHook<Ix>, 
        hook: Hook<Ix, I | Async<I>, C>
    ): Command<Ix, O, C>

}

interface CommandCreate {
    <Ix extends Json>(
        method: HttpMethod, 
        schema: SchemaHook<Ix>
    ): Command<Ix, Ix>

    <Ix extends Json, Ox extends Json | Async<Json>, Cx extends Provide>(
        method: HttpMethod, 
        schema: SchemaHook<Ix>, 
        hook: Hook<Ix, Ox, Cx>
    ): Command<Ix, FromAsync<Ox>, Cx>
}

interface CommandCreateWithMethod {
    <Ix extends Json>(schema: SchemaHook<Ix>): Command<Ix, Ix>
    <Ix extends Json, Ox extends Json | Async<Json>, Cx extends Provide>(
        schema: SchemaHook<Ix>, 
        hook: Hook<Ix, Ox, Cx>
    ): Command<Ix, FromAsync<Ox>, Cx>
}

type NodeConstructor = typeof Node
interface CommandConstructor extends NodeConstructor {

    list: typeof commandList

    isCommand<I extends Json, O extends Json, C extends Provide>(
        input: unknown
    ): input is Command<I,O,C>
    
    create: CommandCreate
    get: CommandCreateWithMethod
    post: CommandCreateWithMethod
    patch: CommandCreateWithMethod
    put: CommandCreateWithMethod
    delete: CommandCreateWithMethod

}

//// Implementation ////

type _CommandExecute = Execute<Json, Json | Async<Json>, Provide>

const Command = callable(
    function (json: Json): Async<Json> {
        // TODO handle provisions
        const ctx = {}

        const input = this.schema.validate(json)

        const output = this.execute(input, ctx)
    
        return toAsync(output)
    }, 
    class _Command extends Node<[RequestHandler, _CommandExecute], {}> {

        static isCommand(input: unknown): input is Command {
            return callable.isInstance(input, Command)
        }

        static list = commandList

        static override create(
            method: HttpMethod, 
            schema: SchemaHook<Json>, 
            hook: Hook<Json, Json, Provide> = through
        ): Command {

            const schematic = toSchematic(schema)

            return _Command._create(
                RequestHandler.create(method, schematic), 
                new Execute(hook)
            )
        }

        private static _create(
            handler: RequestHandler,
            execute: _CommandExecute
        ): Command { 
            return new Command(
                {},
                handler,
                execute
            ) as unknown as Command
        }

        static get(schema: SchemaHook<Json>, hook?: Hook): Command {
            return this.create(HttpMethod.Get, schema, hook)
        }
        static post(schema: SchemaHook<Json>, hook?: Hook): Command {
            return this.create(HttpMethod.Post, schema, hook)
        }
        static put(schema: SchemaHook<Json>, hook?: Hook): Command {
            return this.create(HttpMethod.Put, schema, hook)
        }
        static patch(schema: SchemaHook<Json>, hook?: Hook): Command {
            return this.create(HttpMethod.Patch, schema, hook)
        }
        static delete(schema: SchemaHook<Json>, hook?: Hook): Command {
            return this.create(HttpMethod.Delete, schema, hook)
        }

        //// Constructr ////
        
        constructor(nodes: Nodes, ...modules: [RequestHandler<Json>, _CommandExecute]) {
            super(nodes, ...modules)
        }

        override validate(): void {
            super.validate()

            // HACK: Fix refs that are broken as a result of the callable instance wrapping.
            for (const module of this.modules) 
                Module._refs.set(module, this)

        }

        //// Request Handler Shorcuts ////
        
        get req(): RequestHandler {
            return this.module(0)
        }
        setReq(reqOrUpdate: RequestHandler | ((req: RequestHandler) => RequestHandler)): Command {
            const newReq = reqOrUpdate instanceof RequestHandler 
                ? reqOrUpdate 
                : reqOrUpdate(this.req)
            return _Command._create(newReq, copy(this.execute))
        }

        get method(): HttpMethod {
            return this.req.method
        }
        setMethod(method: HttpMethod): Command {
            return this.setReq(req => req.setMethod(method))
        }
    
        get schema(): Schematic<Json> {
            return this.req.schema
        }
        setSchema(schema: SchemaHook<Json>): Command {
            return this.setReq(req => req.setSchema(schema))
        }
    
        //// Execute Shortcuts ////
    
        get execute(): _CommandExecute {
            return this.module(1)
        }

        private _setExecute(execute: _CommandExecute): Command {
            return _Command._create(copy(this.req), execute)
        }
    
        appendHook(
            hook: Hook<Json, Json, Provide>
        ): Command {
            return this._setExecute(
                Execute.append(this.execute, hook)
            )
        }
    
        prependHook(
            ...args: [Hook<Json, Json, Provide>] | [Schematic<Json>, Hook<Json, Json, Provide>]
        ): Command {

            const [hook = through] = pluck(args, isFunc)
            const [schema] = args as Schematic<Json>[]

            return schema 
                ? this
                    .setSchema(schema)
                    .prependHook(
                        // prevent behaviour changes in future hooks
                        // by leaving the input data shape unchanged from 
                        // their perspective
                        Pipe.from(hook).to(this.schema.validate)
                    )
                
                : this._setExecute(
                    Execute.prepend(this.execute, hook)
                )
        }

    },
    'Command'
) as CommandConstructor

//// Exports ////

export default Command

export {
    Command,
    Hook as CommandHook,
    Provide as CommandProvisions,
}