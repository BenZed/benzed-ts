/**
 * This is all copy/pasted from the @featherjs declarations.
 * 
 * Why?
 * 
 * In direct contravention with this build tool, @featherjs is not
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
export type Id = string | number 

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

export interface Service<T = any, D = Partial<T>, P = Params> {
    find(params?: P): Promise<T | T[]>
    get(id: Id, params?: P): Promise<T>
    create(data: D, params?: P): Promise<T>
    update(id: NullableId, data: D, params?: P): Promise<T | T[]>
    patch(id: NullableId, data: D, params?: P): Promise<T | T[]>
    remove(id: NullableId, params?: P): Promise<T | T[]>
    setup?(app: App, path: string): Promise<void>
    teardown?(app: App, path: string): Promise<void>
}

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
     * Retrieve an application setting by name
     *
     * @param name The setting name
     */
    get<L extends keyof C & string>(name: L): C[L]
    /**
     * Set an application setting
     *
     * @param name The setting name
     * @param value The setting value
     */
    set<L extends keyof C & string>(name: L, value: C[L]): this

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
    use<L extends keyof S & string>(
        path: L, 
        service: keyof any extends keyof S 
            ? ServiceInterface | Application 
            : S[L], options?: ServiceOptions
    ): this
    /**
     * Unregister an existing service.
     *
     * @param path The name of the service to unregister
     */
    unuse<L extends keyof S & string>(
        path: L
    ): Promise<FeathersService<this, keyof any extends keyof S ? Service : S[L]>>
    /**
     * Get the Feathers service instance for a path. This will
     * be the service originally registered with Feathers functionality
     * like hooks and events added.
     *
     * @param path The name of the service.
     */
    service<L extends keyof S & string>(path: L): FeathersService<this, keyof any extends keyof S 
        ? Service 
        : S[L]>
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
    hooks(map: ApplicationHookOptions<this>): this
}

export type Config = { [key: string]: unknown }
export type ConfigOf<A extends App> = A extends App<any, infer C> ? C : Empty

export type Services = { [key: string]: Service }
export type ServicesOf<A extends App> = A extends App<infer S, any> ? S : Empty

export type Extends = { [key: string]: (this: App, ...args: any) => any }