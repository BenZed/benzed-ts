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

type FeathersComponentConstructor<C extends FeathersComponent = FeathersComponent, A extends boolean = false> = 
    A extends true 
        ? abstract new (...args: any[]) => C 
        : new (...args: any[]) => C

/*** Components ***/

type FeathersComponents = readonly FeathersComponent[]

/**
 * Component that makes mutations to the app
 */
abstract class FeathersComponent extends Component<FeathersBuildContext> {

    // Components Api

    private _components!: FeathersComponents
    get components(): FeathersComponents {
        if (!this._components)
            throw new Error(`Components can only be accessed after being added to a builder.`)

        return this._components
    }

    setComponents(components: FeathersComponents): void {
        this._components = components
        this._onValidateComponents()
    }

    getComponent = <C extends FeathersComponent, A extends boolean>(type: FeathersComponentConstructor<C, A>): C | null => 
        (this._components.find(c => c instanceof type) ?? null) as C | null

    hasComponent = <C extends FeathersComponent, A extends boolean>(...types: FeathersComponentConstructor<C, A>[]): boolean => 
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
abstract class FeathersBuildComponent<B extends BuildEffect = BuildEffect> extends FeathersComponent {

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
> extends FeathersBuildComponent<{ extends: E }> {

    protected abstract _createBuildExtends(): E

    protected _createBuildEffect(): { extends: E } {
        return {
            extends: this._createBuildExtends()
        }
    }

}

abstract class FeathersConfigComponent<
    C extends Exclude<BuildEffect['config'], undefined>,
> extends FeathersBuildComponent<{ config: C }> {

    protected abstract _createBuildConfig(): C

    protected _createBuildEffect(): { config: C } {
        return {
            config: this._createBuildConfig()
        } 
    }

}

abstract class FeathersServiceComponent<
    S extends Exclude<BuildEffect['services'], undefined>,
> extends FeathersBuildComponent<{ services: S }> {

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