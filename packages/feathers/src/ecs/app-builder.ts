import { feathers as _feathers } from '@feathersjs/feathers'

import { Empty, StringKeys} from '@benzed/util'

import { 
    FeathersBuilder, 
    FeathersModules, 
    FeathersModule, 
    FeathersModuleConstructor, 
    FeathersModuleInitMethod 
} from './module'

import { LifeCycleMethod, FeathersBuildContext, FromBuildEffect } from './types'
import { getDefaultConfiguration } from '../util'
import { App } from '../types'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

/*** Types ***/

type BuiltServices<C extends FeathersModules> = FromBuildEffect<C>['services']

type BuiltConfig<C extends FeathersModules> = FromBuildEffect<C>['config']

type BuiltExtensions<C extends FeathersModules> = FromBuildEffect<C>['extends']

export type BuiltApp<C extends FeathersModules> = 
    BuiltExtensions<C> extends Empty 
        ? App<BuiltServices<C>, BuiltConfig<C>>
        : App<BuiltServices<C>, BuiltConfig<C>> & BuiltExtensions<C>

type FeathersBuilderInput<C extends FeathersModules> = BuiltConfig<C>

type FeathersBuilderOutput<C extends FeathersModules> = BuiltApp<C>

type FeathersInput<B extends FeathersAppBuilder<any>> = B extends FeathersAppBuilder<infer C> 
    ? FeathersBuilderInput<C> 
    : unknown

type FeathersOutput<B extends FeathersAppBuilder<any>> = B extends FeathersAppBuilder<infer C> 
    ? FeathersBuilderOutput<C> 
    : unknown

/*** Builder ***/

/**
 * ECS Node for creating feathers applications
 */
class FeathersAppBuilder<M extends FeathersModules> extends FeathersBuilder<M> {

    static create(): FeathersAppBuilder<[]> {
        return new FeathersAppBuilder([])
    }

    private constructor(
        modules: M
    ) {
        super(modules)
    }

    override use<Mx extends FeathersModule>(
        constructorOrInitMethod: FeathersModuleConstructor<Mx> | FeathersModuleInitMethod<M, Mx> 
    ): FeathersAppBuilder<[...M, Mx]> {

        return new FeathersAppBuilder([
            ...this.components, 
            this._initializeModule(constructorOrInitMethod)
        ])
    }

    build(config: FeathersBuilderInput<M> = getDefaultConfiguration()): FeathersBuilderOutput<M> {

        this._assertAtLeastOneComponent()

        const ctx = this.compute({
            config: {},
            extends: {},
            services: {},

            onCreate: [],
            onConfig: []
        })
        
        const app = this._createApplication(config, ctx)

        this._registerServices(app, ctx.services)
        this._applyExtensions(app, ctx.extends)

        return app as FeathersBuilderOutput<M>
    }

    // Helper 

    private _createApplication(config: FeathersBuilderInput<M>, ctx: FeathersBuildContext): App {

        const app = this._runLifeCycleMethod(_feathers() as any, ctx.onCreate)

        for (const [ key, { validate } ] of Object.entries(ctx.config)) {

            const property = key as StringKeys<FeathersBuilderInput<M>>

            const value = config[property]

            app.set(
                property,  
                validate(value)
            )
        }

        this._runLifeCycleMethod(app, ctx.onConfig)

        return app
    }

    private _registerServices(app: App, services: FeathersBuildContext['services']): void {
        for (const path in services) {
            const service = services[path](app)

            if (!(path in app.services))
                app.use(path, service)
        }
    }

    private _applyExtensions(app: App, extend: FeathersBuildContext['extends']): void {
        Object.assign(app, extend)
    }

    private _runLifeCycleMethod(app: App, methods: readonly LifeCycleMethod[]): App {

        for (const method of methods) {
            const result = method(app) as App | undefined
            if (result)
                app = result
        }

        return app
    }

}

/*** Exports ***/

export default FeathersAppBuilder

export {
    FeathersAppBuilder,
    FeathersInput,
    FeathersOutput
}