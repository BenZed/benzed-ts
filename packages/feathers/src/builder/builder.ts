
import { feathers } from '@feathersjs/feathers'

import BuildComponent, { 

    App, 

    BuildComponents, 
    BuildContext,

    FromBuildEffect 

} from './build-component'

import { getDefaultConfiguration } from '../util'

import { 
    Compile, 
    StringKeys, 
    through 
} from '@benzed/util'

import { Node } from '@benzed/ecs'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

/*** Types ***/

type BuiltConfig<C extends BuildComponents> = FromBuildEffect<C>['config']

type BuiltServices<C extends BuildComponents> = FromBuildEffect<C>['services']

export type BuiltApplication<C extends BuildComponents> = 
    App<BuiltServices<C>, BuiltConfig<C>>

type BuilderInput<C extends BuildComponents> = BuiltConfig<C> 

type BuilderOutput<C extends BuildComponents> =     
    Compile<BuiltApplication<C>, App, false>

type AddBuildComponent<C extends BuildComponents> = BuildComponent<any,any,any>

/*** Builder ***/

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
        return app
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
export const builder = new Builder<[]>([{ compute: through }] as unknown as any)

export default builder