import { isString, TypeGuard, nil, pass, isNumber, isArray, isBoolean } from '@benzed/util'
import { equals, $$equals, $$copy, CopyComparable } from '@benzed/immutable'
import { wrap } from '@benzed/array'

import type Modules from './modules'

/* eslint-disable 
    @typescript-eslint/no-this-alias,
*/

//// Types ////

const $$isModuleConstructor = Symbol('is-module-constructor')

type ModuleConstructor<M extends Module> = (new (state: object) => M)

interface ModuleTypeGuard<M extends Module> extends TypeGuard<M, Module> {}

export type FindModule<M extends Module> = ModuleTypeGuard<M> | ModuleConstructor<M> | M

export type FindScope = 'parents' | 'siblings' | 'children'

export type ModuleParent = Modules<readonly Module[]>

//// Definition ////

class Module<S = unknown> implements CopyComparable {

    /**
     * @internal
     * Allows the find() method to differentiate between type guards and module constructors,
     * ensuring edge cases:
     * - modules extended by callable
     * - function () {} typeguards
     */
    static [$$isModuleConstructor] = true
 
    constructor(protected readonly _state: S) {}

    get state(): Readonly<S> {
        return this._state
    }

    getState(): Readonly<S> {
        return this.state
    }

    setState(state: S): this {
        const Constructor = this.constructor as new (state: S) => this
        return new Constructor(state)
    }

    /**
     * Root module of this node. 
     * Self if node is unparented.
     */
    get root(): Module | ModuleParent {
        let module: Module<unknown> = this
        while (module.parent)
            module = module.parent
        
        return module
    }

    /**
     * Parent of this node.
     * nil if no parent.
     */
    get parent(): ModuleParent | nil {
        return this._parent
    }
    private _parent: ModuleParent | nil

    /**
     * @internal
     */
    _setParent(parent: ModuleParent): void {
        if (this._parent) 
            throw new Error('Parent is already set.')

        this._parent = parent
    }

    /**
     * All of the modules on this module's parent (including this one)
     * Returns an empty array if this module has no parent.
     */
    get modules(): readonly Module[] {
        return this.parent?.modules ?? []
    }

    /**
     * Siblings of this node
     */
    get siblings(): readonly Module[] {
        return this.parent?.modules.filter(other => other !== this) ?? []
    }

    find(scope: FindScope | readonly FindScope[], required?: boolean | number): Module[]
    find<M extends Module>(type: FindModule<M>, required?: boolean | number): M[]
    find<M extends Module>(type: FindModule<M>, scope?: FindScope | readonly FindScope[], required?: boolean | number): M[]
    find(...args: unknown[]): Module[] {

        const [input, scope = 'siblings', required = false] = 
        (
            isString(args[0]) || isArray(args[0])

            // .find(scope|s, required?)
                ? [pass, ...args]
            
                : isNumber(args[1]) || isBoolean(args[1])

                // .find(type, required?)
                    ? [args[0], nil, args[1]]
            
                // .find(type, scope|s?, required?)
                    : args
                    
        ) as [FindModule<Module>, FindScope | nil, number | boolean | nil]

        const found: Module[] = []
        const predicate = toModuleTypeGuard(input)
        const scopes = wrap(scope)

        for (const scope of scopes) {
            switch (scope) {

                case 'siblings': {
                    found.push(
                        ...this.siblings.filter(predicate)
                    )
                    break
                }

                case 'parents': {

                    if (this.parent && predicate(this.parent))
                        found.push(this.parent)

                    if (this.parent) {
                        found.push(
                            ...this.parent.find(predicate, ['siblings', 'parents'], false)
                        )
                    }

                    break
                }

                case 'children': {

                    const hasChildren = !this.modules.includes(this) && this.modules.length > 0
                    if (hasChildren) {
                        const children = this.modules
                        found.push(
                        // only push the siblings of the first node to prevent duplication
                            ...children[0].siblings.filter(predicate),
                            // descendants
                            ...children.flatMap(m => m.find(predicate, 'children', false))
                        )
                    }
                    break
                }

                default: {
                    const badScope: never = scope
                    throw new Error(`${badScope} is an invalid scope.`)
                }
            }
        }

        // ensure required
        const min = isNumber(required) ? required : required ? 1 : 0
        if (found.length < min) {
            throw new Error(
                `Could not find ${toModuleName(input)} in scope ${scope}`
            )
        }

        return found
    }

    has<M extends Module>(type: FindModule<M>, scope?: FindScope): boolean {
        return this.find(type, scope).length > 0
    }

    assert<M extends Module>(type: FindModule<M>, scope?: FindScope): void {
        void this.find(type, scope, true)
    }

    //// Helper ////

    [$$equals](input: unknown): input is this {
        return input instanceof Module && 
            input.constructor === this.constructor && 
            equals(this._state, input._state)
    }

    [$$copy](): this {
        return this.setState(this._state)
    }

}

//// Helper ////

function isModuleConstructor<M extends Module>(input: TypeGuard<M, Module<unknown>> | ModuleConstructor<M>): input is ModuleConstructor<M> {
    return $$isModuleConstructor in input && !!input[$$isModuleConstructor]
}

function toModuleTypeGuard<M extends Module>(input: FindModule<M>): ModuleTypeGuard<M> {
    if (input instanceof Module)
        return ((other) => equals(other, input)) as ModuleTypeGuard<M>
        
    if (isModuleConstructor(input))
        return ((other) => other instanceof input) as ModuleTypeGuard<M>

    return input
} 

function toModuleName<M extends Module>(input: FindModule<M>): string {
    
    let name = input instanceof Module 
        ? input.constructor.name 
        : input.name
   
    // assume typeguard with convention isModuleName
    if (name.startsWith('is'))
        name = name.slice(0, 2)

    // assume anonymous typeguard
    if (!name)
        return Module.name
    
    return name
        
}

//// Exports ////

export default Module 

export {
    Module
}