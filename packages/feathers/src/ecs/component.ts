import { Component } from '@benzed/ecs'

import { 
    BuildEffect,
    LifeCycleMethod,
    FeathersBuildContext,
    CreateLifeCycleMethod, 

} from './types'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Requirements ***/

export type FeathersComponentConstructor<C extends FeathersComponent = FeathersComponent, A extends boolean = false> = 
    A extends true 
        ? abstract new (arg: any) => C 
        : new (arg: any) => C

/*** Components ***/

type FeathersComponents = readonly FeathersComponent[]

/**
 * Component that makes mutations to the app
 */
abstract class FeathersComponent<C extends FeathersComponents = any> extends Component<FeathersBuildContext> {

    constructor(
        private readonly _components: C
    ) {
        super()
        this._onValidateComponents()
    }
    // Components Api

    get components(): C {
        return this._components
    }

    getComponent = <Cx extends C[number], A extends boolean>(type: FeathersComponentConstructor<Cx, A>): Cx | null => 
        (this._components.find(c => c instanceof type) ?? null) as Cx | null

    hasComponent = <Cx extends C[number], A extends boolean>(...types: FeathersComponentConstructor<Cx, A>[]): boolean => 
        types.some(this.getComponent)

    // Build Api

    /**
     * Called when the app is created. 
     * Mutations made to the app object on create can be
     * returned to affect the actual app.
     */
    protected _onCreate?: CreateLifeCycleMethod

    /**
     * Called after the app is first configured.
     */
    protected _onConfig?: LifeCycleMethod

    compute(ctx: FeathersBuildContext): FeathersBuildContext {
     
        for (const lifeCycleName of [`onCreate`, `onConfig`] as const) {

            const lifeCyleMethod = this[`_${lifeCycleName}`]
                ? [this[`_${lifeCycleName}`]] 
                : []
            
            ctx = {
                ...ctx,
                [lifeCycleName]: [
                    ...ctx[lifeCycleName],
                    ...lifeCyleMethod
                ]
            }
        }

        return ctx
    }

    // Validation API 

    protected _onValidateComponents(): void { /**/ }

    protected _assertConflicting<A extends boolean>(...types: FeathersComponentConstructor<any,A>[]): void {
        const found = types.filter(t => this.hasComponent(t))
        if (found.length > 0)
            throw new Error(`${this.constructor.name} cannot be used with conflicting components: ${found.map(m => m.name)}`)
    }

    protected _assertRequired<A extends boolean>(...types: FeathersComponentConstructor<any,A>[]): void {
        const missing = types.filter(t => !this.hasComponent(t))
        if (missing.length > 0)
            throw new Error(`${this.constructor.name} missing required components: ${missing.map(m => m.name)}`)
    }

    protected _assertSingle(): void {
        if (this.hasComponent(this.constructor as any))
            throw new Error(`${this.constructor.name} cannot be used more than once.`)
    }
}

/**
 * Base class for components that construct feathers applications
 */
abstract class FeathersBuildComponent<B extends BuildEffect = BuildEffect, C extends FeathersComponents = any> extends FeathersComponent<C> {

    /**
     * A feathers build component can run lifecycle nmethods, but
     * also has effects that change the type of the app.
     */
    protected abstract _createBuildEffect(): B

    compute(ctx: FeathersBuildContext): FeathersBuildContext {
        
        const effect = this._createBuildEffect()

        return super.compute({
            ...ctx,
            config: {
                ...ctx.config,
                ...effect.config
            },
            services: {
                ...ctx.services,
                ...effect.services
            },
            extends: {
                ...ctx.extends,
                ...effect.extends
            }
        })
    }
}

abstract class FeathersExtendComponent<
    E extends Exclude<BuildEffect['extends'], undefined>,
    C extends FeathersComponents,
> extends FeathersBuildComponent<{ extends: E }, C> {

    protected abstract _createBuildExtends(): E

    protected _createBuildEffect(): { extends: E } {
        return {
            extends: this._createBuildExtends()
        }
    }

}

abstract class FeathersConfigComponent<
    S extends Exclude<BuildEffect['config'], undefined>,
    C extends FeathersComponents,
> extends FeathersBuildComponent<{ config: S }, C> {

    protected abstract _createBuildConfig(): S

    protected _createBuildEffect(): { config: S } {
        return {
            config: this._createBuildConfig()
        } 
    }

}

abstract class FeathersServiceComponent<
    S extends Exclude<BuildEffect['services'], undefined>,
    C extends FeathersComponents,
> extends FeathersBuildComponent<{ services: S }, C> {

    protected abstract _createBuildServices(): S

    protected _createBuildEffect(): { services: S } {
        return {
            services: this._createBuildServices()
        } 
    }

}

/*** Exports ***/

export default FeathersBuildComponent

export {
    FeathersComponent,
    FeathersComponents,

    FeathersBuildComponent,

    FeathersExtendComponent,
    FeathersConfigComponent,
    FeathersServiceComponent
}