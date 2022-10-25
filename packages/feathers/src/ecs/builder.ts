import { feathers as _feathers } from '@feathersjs/feathers'

import { Empty, StringKeys} from '@benzed/util'
import { Node } from '@benzed/ecs'

import FeathersComponent, { FeathersComponents, FeathersComponentRequirements } from './component'

import { FeathersBuildContext, FromBuildEffect } from './types'
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

export type FeathersBuilderInput<C extends FeathersComponents> = BuiltConfig<C>

export type FeathersBuilderOutput<C extends FeathersComponents> = BuiltApp<C>

type ComponentsContain<A extends FeathersComponents, B extends FeathersComponents> =
    B extends [infer Bx, ...infer Bxr]
        ? Bx extends A[number]
            ? true
            : Bxr extends FeathersComponents 
                ? ComponentsContain<A, Bxr> 
                : false 
        : false

type CheckSingle<
    /**/ C extends FeathersComponents, 
    /**/ Cx extends FeathersComponent, 
    /**/ S extends boolean
> = S extends true 
    ? ComponentsContain<C, [Cx]> extends true 
        ? never
        : Cx
    : Cx 

type AddFeathersBuildComponent<C extends FeathersComponents, Cx extends FeathersComponent<any,any>> = 
    Cx['requirements'] extends FeathersComponentRequirements<infer R, infer S> 
        ? R extends []
            ? CheckSingle<C, Cx, S>
            : ComponentsContain<C, R> extends true 
                ? CheckSingle<C, Cx, S> 
                : never
        : Cx

/*** Builder ***/

/**
 * ECS Node for creating feathers applications
 */
class FeathersBuilder<C extends FeathersComponents> extends Node<FeathersBuilderInput<C>, FeathersBuilderOutput<C>, C> {

    add<Cx extends FeathersComponent<any,any>>(
        component: AddFeathersBuildComponent<C,Cx>
    ): FeathersBuilder<[...C, AddFeathersBuildComponent<C,Cx>]> {

        this._handleComponentRequirements(component)

        return new FeathersBuilder([
            ...this.components, 
            component
        ])
    }

    compute(config: FeathersBuilderInput<C>): FeathersBuilderOutput<C> {

        this._assertAtLeastOneComponent()

        const ctx = this._computeBuildContext()
        
        const app = this._createApplication(config, ctx.config)

        this._registerServices(app, ctx.services)
        this._applyExtensions(app, ctx.extends)

        return app as FeathersBuilderOutput<C>
    }

    build(config: FeathersBuilderInput<C> = getDefaultConfiguration()): FeathersBuilderOutput<C> {
        return this.compute(config)
    }

    // Helper 

    private _registerServices(app: App, services: FeathersBuildContext['services']): void {
        for (const path in services) {
            const service = services[path](app)

            if (!(path in app.services))
                app.use(path, service)
        }
    }

    private _computeBuildContext(): FeathersBuildContext {
    
        let ctx: FeathersBuildContext = {
            config: {},
            extends: {},
            services: {},

            onConfigure: [],
            required: []
        }

        for (const component of this.components) 
            ctx = component.compute(ctx)

        return ctx
    }

    private _createApplication(config: FeathersBuilderInput<C>, configCtx: FeathersBuildContext['config']): App {
        const app = _feathers() as unknown as App

        for (const [ key, { validate } ] of Object.entries(configCtx)) {

            const property = key as StringKeys<FeathersBuilderInput<C>>

            const value = config[property]

            app.set(
                property,  
                validate(value)
            )
        }

        return app
    }

    private _handleComponentRequirements<Cx extends FeathersComponent<any,any>>(
        component: Cx
    ): void {

        const { requirements } = component
        if (!requirements)
            return 

        // Check required components
        const missing = [...requirements.types]
            .filter(type => !this.has(type))
            .map(t => t.name)
        if (missing.length > 0) {
            throw new Error(
                `Requires component: ${missing}`
            )
        }

        // Check single component
        if (requirements.single && this.components.some(c => c instanceof component.constructor)) {
            throw new Error(
                `Component ${component.constructor.name} can only be added once`
            )
        }

        requirements.components = requirements.types.map(this.get.bind(this))
    }

    private _applyExtensions(app: App, eCtx: FeathersBuildContext['extends']): void {

        for (const [ key, extension ] of Object.entries(eCtx)) {
            const property = key as keyof App
            app[property] = extension.bind(app)
        }

    }

}

/*** Exports ***/

/**
 * An ECS for building feathers applications
 */
export const feathers = new FeathersBuilder<[]>([])

export default feathers