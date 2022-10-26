import { feathers as _feathers } from '@feathersjs/feathers'

import { Empty, StringKeys} from '@benzed/util'
import { Node } from '@benzed/ecs'
import is from '@benzed/is'

import { FeathersComponents, FeathersComponent, FeathersComponentConstructor } from './component'

import { LifeCycleMethod, FeathersBuildContext, FromBuildEffect } from './types'
import { App } from '../types'

import { getDefaultConfiguration } from '../util'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

/*** Types ***/

type BuiltServices<C extends FeathersComponents> = FromBuildEffect<C>['services']

type BuiltConfig<C extends FeathersComponents> = FromBuildEffect<C>['config']

type BuiltExtensions<C extends FeathersComponents> = FromBuildEffect<C>['extends']

type BuiltApp<C extends FeathersComponents> = 
    BuiltExtensions<C> extends Empty 
        ? App<BuiltServices<C>, BuiltConfig<C>>
        : App<BuiltServices<C>, BuiltConfig<C>> & BuiltExtensions<C>

type FeathersBuilderInput<C extends FeathersComponents> = BuiltConfig<C>

type FeathersBuilderOutput<C extends FeathersComponents> = BuiltApp<C>

type FeathersInput<B extends FeathersBuilder<any>> = B extends FeathersBuilder<infer C> 
    ? FeathersBuilderInput<C> 
    : unknown

type FeathersOutput<B extends FeathersBuilder<any>> = B extends FeathersBuilder<infer C> 
    ? FeathersBuilderOutput<C> 
    : unknown

/*** Builder ***/

/**
 * ECS Node for creating feathers applications
 */
class FeathersBuilder<C extends FeathersComponents> extends Node<FeathersBuilderInput<C>, FeathersBuilderOutput<C>, C> {

    static create(): FeathersBuilder<[]> {
        return new FeathersBuilder([])
    }

    private constructor(
        components: C
    ) {
        super(components)
    }

    add<Cx extends FeathersComponent>(
        input: FeathersComponentConstructor<Cx> | ((c: C) => Cx)
    ): FeathersBuilder<[...C, Cx]> {

        let component: Cx 
        try {
            component = (input as any)(this.components)
        } catch {
            component = new (input as any)(this.components)
        } finally {}

        if (!(component instanceof FeathersComponent))
            throw new Error(`Must be an instance of ${FeathersComponent}`)

        return new FeathersBuilder([
            ...this.components, 
            component
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
export const feathers = FeathersBuilder.create()

export default feathers

export {
    FeathersBuilder,
    FeathersInput,
    FeathersOutput
}