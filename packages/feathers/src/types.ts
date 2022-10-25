
/*** Exports ***/

import { EventEmitter, Func } from '@benzed/util'

export type {
    StringKeys
} from '@benzed/util'

export type {

    MongoDBConfig,
    ObjectId,
    Db,

} from './mongo-db-app/setup-mongo-db'

export type {

    MongoDBApplication,
    MongoDBApplicationConfig

} from './mongo-db-app/create-mongo-db-application'

/**
 * This is all copy/pasted from the @featherjs declarations.
 * 
 * Why?
 * 
 * In direct contravention with the builder tool, @featherjs is not
 * intended to be modular. Importing object from their distributed
 * packages changes the declaration of the Application type, which
 * will lead to this build tool exporting apps with inaccurate 
 * interfaces. 
 * 
 * Also, I can improve on these types and make pull requests to @feathersjs
 */

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

export interface Params<Q = Query> {
    query?: Q
    provider?: string
    route?: {
        [key: string]: any
    }
    headers?: {
        [key: string]: any
    }
}

type SelfOrArray<S> = S | S[]

type OptionalPick<T, K extends PropertyKey> = Pick<T, Extract<keyof T, K>>

type NextFunction = () => Promise<any>

/**
 * The object returned from `.find` call by standard database adapters
 */
export interface Paginated<T> {
    total: number
    limit: number
    skip: number
    data: T[]
}
/**
 * Options that can be passed when registering a service via `app.use(name, service, options)`
 */
export interface ServiceOptions {
    events?: string[] | readonly string[]
    methods?: string[] | readonly string[]
    serviceEvents?: string[] | readonly string[]
    routeParams?: {
        [key: string]: any
    }
}

export interface Service<T extends object = object, D extends object = Partial<T>, P = Params> {

    find(params?: P): Promise<T | T[]>

    get(id: Id, params?: P): Promise<T>

    create(data: D, params?: P): Promise<T>

    update(id: NullableId, data: D, params?: P): Promise<T | T[]>

    patch(id: NullableId, data: D, params?: P): Promise<T | T[]>

    remove(id: NullableId, params?: P): Promise<T | T[]>

    setup?(app: App 
        , path: string): Promise<void>

    teardown?(app: App 
        , path: string): Promise<void>

}

export type ServiceInterface<T extends object = object, D extends object = Partial<T>, P = Params> = Partial<Service<T, D, P>>

export type ServiceEvents<S extends Service> = {
    [K in Exclude<keyof S, 'setup' | 'teardown'>]: Parameters<S[K] extends Func<any,any,any> ? S[K] : () => void>
}

export interface ServiceAddons<A extends App = App 
    , S extends Service = Service> extends EventEmitter<ServiceEvents<S>> {
    id?: string
    hooks(options: HookOptions<A, S>): this
}

export interface ServiceHookOverloads<S, P = Params> {

    find(
        params: P, 
        context: HookContext
    ): Promise<HookContext>

    get(
        id: Id, 
        params: P, 
        context: HookContext
    ): Promise<HookContext>
        
    create(
        data: ServiceGenericData<S> | ServiceGenericData<S>[], 
        params: P, 
        context: HookContext
    ): Promise<HookContext>
    update(
        id: NullableId,
        data: ServiceGenericData<S>, 
        params: P, 
        context: HookContext
    ): Promise<HookContext>

    patch(
        id: NullableId, 
        data: ServiceGenericData<S>, 
        params: P, 
        context: HookContext
    ): Promise<HookContext>

    remove(
        id: NullableId, 
        params: P,
        context: HookContext
    ): Promise<HookContext>
}
export type FeathersService<
    A extends App = App, 
    S extends Service = Service
> = S & ServiceAddons<A, S> & OptionalPick<ServiceHookOverloads<S>, keyof S>

export type ServiceGenericType<S> = S extends ServiceInterface<infer T> ? T : any
export type ServiceGenericData<S> = S extends ServiceInterface<any, infer D> ? D : any
export type ServiceGenericParams<S> = S extends ServiceInterface<any, any, infer P> 
    ? P 
    : any

export type AppEvents = EventEmitter<{'connect': [] }>
export interface App<S extends Services = any, C extends Config = any> {

    /**
     * The index of all services keyed by their path.
     *
     * __Important:__ Services should always be retrieved via `app.service('name')`
     * not via `app.services`.
     */
    services: S

    /**
     * The application settings that can be used via
     * `app.get` and `app.set`
     */
    settings: C

    /**
     * A private-ish indicator if `app.setup()` has been called already
     */
    _isSetup: boolean

    /**
     * Retrieve an application setting by name
     *
     * @param name The setting name
     */
    get<L extends keyof C>(name: L): C[L]

    /**
     * Set an application setting
     *
     * @param name The setting name
     * @param value The setting value
     */
    set<L extends keyof C>(name: L, value: C[L]): this

    /**
     * Runs a callback configure function with the current application instance.
     *
     * @param callback The callback `(app: Application) => {}` to run
     */
    configure(callback: (this: this, app: this) => void): this
    
    /**
     * Returns a fallback service instance that will be registered
     * when no service was found. Usually throws a `NotFound` error
     * but also used to instantiate client side services.
     *
     * @param location The path of the service
     */
    defaultService(location: string): ServiceInterface
    
    /**
     * Register a new service or a sub-app. When passed another
     * Feathers application, all its services will be re-registered
     * with the `path` prefix.
     *
     * @param path The path for the service to register
     * @param service The service object to register or another
     * Feathers application to use a sub-app under the `path` prefix.
     * @param options The options for this service
     */
    use<P extends string>(path: P, service: P extends keyof S 
        ? S[P]
        : ServiceInterface | App 
        , 
        options?: ServiceOptions
    ): this
    
    /**
     * Unregister an existing service.
     *
     * @param path The name of the service to unregister
     */
    unuse<P extends string>(path: P): Promise<FeathersService<this, P extends keyof S ? S[P] : Service>>

    /**
     * Get the Feathers service instance for a path. This will
     * be the service originally registered with Feathers functionality
     * like hooks and events added.
     *
     * @param path The name of the service.
     */
    service<P extends string>(path: P): FeathersService<this, P extends keyof S ? S[P] : Service>
    
    /**
     * Set up the application and call all services `.setup` method if available.
     *
     * @param server A server instance (optional)
     */
    setup(server?: any): Promise<this>

    /**
     * Tear down the application and call all services `.teardown` method if available.
     *
     * @param server A server instance (optional)
     */
    teardown(server?: any): Promise<this>

    /**
     * Register application level hooks.
     *
     * @param map The application hook settings.
     */
    hooks(map: AppHookOptions<this>): this
}

export type Id = number | string

export type NullableId = Id | null
export interface Query {
    [key: string]: any
}
export interface Params<Q = Query> {
    query?: Q
    provider?: string
    route?: {
        [key: string]: any
    }
    headers?: {
        [key: string]: any
    }
}
export interface Http {
    /**
     * A writeable, optional property with status code override.
     */
    status?: number
    /**
     * A writeable, optional property with headers.
     */
    headers?: {
        [key: string]: string | string[]
    }
    /**
     * A writeable, optional property with `Location` header's value.
     */
    location?: string
}

export declare class BaseHookContext<C = any> {
    self?: C;
    [key: string]: any;
    constructor(data?: Data)
}

export type Data = {
    [key: string]: any
}

export interface HookContext<A extends App = App, S extends Service = Service> extends BaseHookContext<ServiceGenericType<S>> {
    
    /**
     * A read only property that contains the Feathers application object. This can be used to
     * retrieve other services (via context.app.service('name')) or configuration values.
     */
    readonly app: A

    /**
     * A read only property with the name of the service method (one of find, get,
     * create, update, patch, remove).
     */
    readonly method?: string

    /**
     * A read only property and contains the service name (or path) without leading or
     * trailing slashes.
     */
    readonly path: string

    /**
     * A read only property and contains the service this hook currently runs on.
     */
    readonly service: S

    /**
     * A read only property with the hook type (one of before, after or error).
     * Will be `null` for asynchronous hooks.
     */
    readonly type: null | 'before' | 'after' | 'error'

    /**
     * The list of method arguments. Should not be modified, modify the
     * `params`, `data` and `id` properties instead.
     */
    readonly arguments: any[]

    /**
     * A writeable property containing the data of a create, update and patch service
     * method call.
     */
    data?: ServiceGenericData<S>

    /**
     * A writeable property with the error object that was thrown in a failed method call.
     * It is only available in error hooks.
     */
    error?: any

    /**
     * A writeable property and the id for a get, remove, update and patch service
     * method call. For remove, update and patch context.id can also be null when
     * modifying multiple entries. In all other cases it will be undefined.
     */
    id?: Id

    /**
     * A writeable property that contains the service method parameters (including
     * params.query).
     */
    params: ServiceGenericParams<S>

    /**
     * A writeable property containing the result of the successful service method call.
     * It is only available in after hooks.
     *
     * `context.result` can also be set in
     *
     * - A before hook to skip the actual service method (database) call
     * - An error hook to swallow the error and return a result instead
     */
    result?: ServiceGenericType<S>

    /**
     * A writeable, optional property and contains a 'safe' version of the data that
     * should be sent to any client. If context.dispatch has not been set context.result
     * will be sent to the client instead.
     */
    dispatch?: ServiceGenericType<S>

    /**
     * A writeable, optional property with options specific to HTTP transports.
     */
    http?: Http

    /**
     * The event emitted by this method. Can be set to `null` to skip event emitting.
     */
    event: string | null

}

export type HookFunction<A extends App = App , S extends Service = Service> = (this: S, context: HookContext<A, S>) =>
/**/ Promise<HookContext<A , S> | void> | HookContext<A , S> | void

export type Hook<A extends App = App , S extends Service = Service> = HookFunction<A, S>

type HookMethodMap<A extends App = App, S extends Service = Service> = {
    [L in keyof S]?: SelfOrArray<HookFunction<A, S>>;
} & {
    all?: SelfOrArray<HookFunction<A, S>>
}

type HookTypeMap<A extends App = App, S extends Service = Service> = SelfOrArray<HookFunction<A, S>> | HookMethodMap<A, S>
export type AroundHookFunction<A extends App = App, S extends Service = Service> = (
    context: HookContext<A, S>, 
    next: NextFunction
) => Promise<void>

export type AroundHookMap<A extends App, S extends Service> = {
    [L in keyof S]?: AroundHookFunction<A, S>[];
} & {
    all?: AroundHookFunction<A, S>[]
}

export type HookMap<A extends App, S extends Service> = {
    around?: AroundHookMap<A, S>
    before?: HookTypeMap<A, S>
    after?: HookTypeMap<A, S>
    error?: HookTypeMap<A, S>
}
export type HookOptions<A extends App, S extends Service> = AroundHookMap<A, S> | AroundHookFunction<A, S>[] | HookMap<A, S>
export interface AppHookContext<A extends App = App> extends BaseHookContext {
    app: A
    server: any
}

export type AppHookFunction<A extends App> = (
    context: AppHookContext<A>, 
    next: NextFunction
) => Promise<void>

export type ApplicationHookMap<A extends App> = {
    setup?: AppHookFunction<A>[]
    teardown?: AppHookFunction<A>[]
}

export type AppHookOptions<A extends App> = HookOptions<A, Service> | ApplicationHookMap<A>

export type Extends = { [key: string]: (this: App, ...args: any) => any }

export type Services = { [key: string]: Service }

export type ServicesOf<A extends App> = A extends App<infer S, any> ? S : Config

export type Config = { [key: string]: unknown }

export type ConfigOf<A extends App> = A extends App<any, infer C> ? C : Config