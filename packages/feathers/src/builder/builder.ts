import BuildComponent, { 
    App, 
    BuildComponents, 
    BuildContext,
    FromBuildEffect 
} from './build-component'

import { getDefaultConfiguration } from '../util'

import { 
    Merge, 
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

type AddBuildComponent<C extends BuildComponents> = BuildComponent<any,any,any>

/*** Builder ***/

/**
 * ECS Node for creating feathers applications
 */
class Builder<C extends BuildComponents> extends Node<BuilderInput<C>, BuilderOutput<C>, C> {

    add<Cx extends AddBuildComponent<C>>(
        component: Cx
    ): Builder<[...C, Cx]> {

        return new Builder([
            ...this.components, 
            component
        ])
    }

    compute(config: BuilderInput<C>): BuilderOutput<C> {

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
}

/*** Exports ***/

/**
 * An ECS for building feathers applications
 */
export const builder = new Builder<[]>([])

export default builder