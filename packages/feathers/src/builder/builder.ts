import { feathers } from '@feathersjs/feathers'

import { Empty, StringKeys} from '@benzed/util'
import { Node } from '@benzed/ecs'

import BuildComponent, { BuildComponents, Requirements } from './build-component'

import { BuildContext, FromBuildEffect } from './types'
import { getDefaultConfiguration } from '../util'
import { App } from '../types'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

/*** Types ***/

type BuiltServices<C extends BuildComponents> = FromBuildEffect<C>['services']
type BuiltConfig<C extends BuildComponents> = FromBuildEffect<C>['config']
type BuiltExtensions<C extends BuildComponents> = FromBuildEffect<C>['extends']

type BuiltApp<C extends BuildComponents> = 
    BuiltExtensions<C> extends Empty 
        ? App<BuiltServices<C>, BuiltConfig<C>>
        : App<BuiltServices<C>, BuiltConfig<C>> & BuiltExtensions<C>

export type BuilderInput<C extends BuildComponents> = BuiltConfig<C>

export type BuilderOutput<C extends BuildComponents> = BuiltApp<C>

export type ComponentsContain<A extends BuildComponents, B extends BuildComponents> =
    B extends [infer Bx, ...infer Bxr]
        ? Bx extends A[number]
            ? true
            : Bxr extends BuildComponents 
                ? ComponentsContain<A, Bxr> 
                : false 
        : false

export type CheckSingle<
    /**/ C extends BuildComponents, 
    /**/ Cx extends BuildComponent, 
    /**/ S extends boolean
> = S extends true 
    ? ComponentsContain<C, [Cx]> extends true 
        ? never
        : Cx
    : Cx 

type AddBuildComponent<C extends BuildComponents, Cx extends BuildComponent<any,any>> = 
    Cx['requirements'] extends Requirements<infer R, infer S> 
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
class Builder<C extends BuildComponents> extends Node<BuilderInput<C>, BuilderOutput<C>, C> {

    add<Cx extends BuildComponent<any,any>>(
        component: AddBuildComponent<C,Cx>
    ): Builder<[...C, AddBuildComponent<C,Cx>]> {

        this._handleComponentRequirements(component)

        return new Builder([
            ...this.components, 
            component
        ])
    }

    compute(config: BuilderInput<C>): BuilderOutput<C> {

        this._assertAtLeastOneComponent()

        const ctx = this._computeBuildContext()
        
        const app = this._createApplication(config, ctx.config)

        this._registerServices(app, ctx.services)
        this._applyExtensions(app, ctx.extends)

        return app as BuilderOutput<C>
    }

    build(config: BuilderInput<C> = getDefaultConfiguration()): BuilderOutput<C> {
        return this.compute(config)
    }

    // Helper 

    private _registerServices(app: App, services: BuildContext['services']): void {
        for (const path in services) {
            const service = services[path](app)

            if (!(path in app.services))
                app.use(path, service)
        }
    }

    private _computeBuildContext(): BuildContext {
    
        let ctx: BuildContext = {
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

    private _createApplication(config: BuilderInput<C>, configCtx: BuildContext['config']): App {
        const app = feathers() as unknown as App

        for (const [ key, { validate } ] of Object.entries(configCtx)) {

            const property = key as StringKeys<BuilderInput<C>>

            const value = config[property]

            app.set(
                property,  
                validate(value)
            )
        }

        return app
    }

    private _handleComponentRequirements<Cx extends BuildComponent<any,any>>(
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

    private _applyExtensions(app: App, eCtx: BuildContext['extends']): void {
    
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
export const builder = new Builder<[]>([])

export default builder