import BuildComponent, { BuildComponents, Requirements } from './build-component'

import { App, BuildContext, FromBuildEffect } from './types'

import { getDefaultConfiguration } from '../util'

import { 
    Empty, 
    StringKeys
} from '@benzed/util'
import { Node } from '@benzed/ecs'

import { feathers } from '@feathersjs/feathers'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

/*** Types ***/

type BuiltServices<C extends BuildComponents> = FromBuildEffect<C>['services']
type BuiltConfig<C extends BuildComponents> = FromBuildEffect<C>['config']
type BuildExtensions<C extends BuildComponents> = FromBuildEffect<C>['extend']

type BuiltApplication<C extends BuildComponents> = 
    BuildExtensions<C> extends Empty 
        ? App<BuiltServices<C>, BuiltConfig<C>>
        : App<BuiltServices<C>, BuiltConfig<C>> & BuildExtensions<C>

type BuilderInput<C extends BuildComponents> = BuiltConfig<C>

type BuilderOutput<C extends BuildComponents> = BuiltApplication<C>

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

type AddBuildComponent<C extends BuildComponents, Cx extends BuildComponent> = 
    Cx['requirements'] extends Requirements<infer R, infer S> 
        ? R extends []
            ? CheckSingle<C, Cx, S>
            : ComponentsContain<C, R> extends true 
                ? CheckSingle<C, Cx, S> 
                : R[number]
        : Cx

/*** Builder ***/

/**
 * ECS Node for creating feathers applications
 */
class Builder<C extends BuildComponents> extends Node<BuilderInput<C>, BuilderOutput<C>, C> {

    add<Cx extends BuildComponent>(
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
        return app as BuilderOutput<C>
    }

    build(config: BuilderInput<C> = getDefaultConfiguration()): BuilderOutput<C> {
        return this.compute(config)
    }

    // Helper 

    private _computeBuildContext(): BuildContext {
    
        let ctx: BuildContext = {

            config: {},
            extend: {},
            services: {},

            onConfigure: [],
            required: []
        }

        for (const component of this.components) 
            ctx = component.compute(ctx)

        return ctx
    }

    private _createApplication(config: BuilderInput<C>, configCtx: BuildContext['config']): App {
        const app = feathers()

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

    private _handleComponentRequirements<Cx extends BuildComponent>(
        component: Cx
    ): void {

        const { requirements } = component
        if (!requirements)
            return 

        // Check required components
        const missing = [...requirements.types]
            .filter(type => !this.has(type))
            .map(t => t.name)
        if (missing.length > 0)
            throw new Error(`Requires component: ${missing}`)

        // Check single component
        if (requirements.single && this.components.some(c => c instanceof component.constructor))
            throw new Error(`Component ${component.constructor.name} can only be added once`)

        // Provide required instances
        requirements.components = requirements.types.map(type => this.get(type))
    }

}

/*** Exports ***/

/**
 * An ECS for building feathers applications
 */
export const builder = new Builder<[]>([])

export default builder