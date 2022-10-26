import { feathers as _feathers } from '@feathersjs/feathers'

import { Empty, StringKeys} from '@benzed/util'
import { Node } from '@benzed/ecs'
import is from '@benzed/is'

import { FeathersModules, FeathersModule, FeathersModuleConstructor } from './module'

import { LifeCycleMethod, FeathersBuildContext, FromBuildEffect } from './types'
import { App } from '../types'

import { getDefaultConfiguration } from '../util'

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

type FeathersModuleInitMethod<C extends FeathersModules, Cx extends FeathersModule> =
    (components: C) => Cx

/*** Builder ***/

/**
 * ECS Node for creating feathers applications
 */
class FeathersAppBuilder<C extends FeathersModules> extends Node<FeathersBuilderInput<C>, FeathersBuilderOutput<C>, C> {

    static create(): FeathersAppBuilder<[]> {
        return new FeathersAppBuilder([])
    }

    private constructor(
        modules: C
    ) {
        super(modules)
    }

    use<Cx extends FeathersModule>(
        constructorOrInitMethod: FeathersModuleConstructor<Cx> | FeathersModuleInitMethod<C, Cx>
    ): FeathersAppBuilder<[...C, Cx]> {

        let modules: Cx 
        try {
            modules = (constructorOrInitMethod as FeathersModuleInitMethod<C, Cx>)(this.components)
        } catch {
            modules = new (constructorOrInitMethod as FeathersModuleConstructor<Cx>)(this.components)
        }

        if (!(modules instanceof FeathersModule))
            throw new Error(`Must be an instance of ${FeathersModule}`)

        return new FeathersAppBuilder([
            ...this.components, 
            modules
        ])
    }

    compute(config: FeathersBuilderInput<C>): FeathersBuilderOutput<C> {

        this._assertAtLeastOneComponent()

        const ctx = this._computeBuildContext()
        
        const app = this._createApplication(config, ctx)

        this._registerServices(app, ctx.services)
        this._applyExtensions(app, ctx.extends)

        return app as FeathersBuilderOutput<C>
    }

    build(config: FeathersBuilderInput<C> = getDefaultConfiguration()): FeathersBuilderOutput<C> {
        return this.compute(config)
    }

    // Helper 

    private _computeBuildContext(): FeathersBuildContext {
    
        let ctx: FeathersBuildContext = {
            config: {},
            extends: {},
            services: {},

            onCreate: [],
            onConfig: []
        }

        for (const component of this.components) 
            ctx = component.compute(ctx)

        return ctx
    }

    private _createApplication(config: FeathersBuilderInput<C>, ctx: FeathersBuildContext): App {

        const app = this._runLifeCycleMethod(_feathers() as any, ctx.onCreate)

        for (const [ key, { validate } ] of Object.entries(ctx.config)) {

            const property = key as StringKeys<FeathersBuilderInput<C>>

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

    private _applyExtensions(app: App, eCtx: FeathersBuildContext['extends']): void {

        for (const [ key, extension ] of Object.entries(eCtx)) {
            const property = key as keyof App

            app[property] = is.function(extension) 
                ? extension.bind(app)
                : extension
        }

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

/**
 * An ECS for building feathers applications
 */
export const feathers = FeathersAppBuilder.create()

export default feathers

export {
    FeathersAppBuilder,
    FeathersInput,
    FeathersOutput
}