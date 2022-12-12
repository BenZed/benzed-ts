import { wrap } from '@benzed/array'
import { 
    equals, 
    $$equals, 
    copy,
    $$copy,
    CopyComparable
} from '@benzed/immutable'

import { 
    isString,  
    isNumber, 
    isArray,
    isBoolean, 
    isObject, 
    isInteger,

    TypeGuard, 
    nil, 
    pass
} from '@benzed/util'

import type Modules from './modules'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/no-this-alias,
    @typescript-eslint/ban-types
*/

//// Types ////

const $$isModuleConstructor = Symbol('is-module-constructor')
type ModuleConstructor<M extends Module> = 
    (new (...args: any) => M) | 
    (abstract new (...args: any) => M)

interface ModuleTypeGuard<M extends Module> extends TypeGuard<M, Module> {}

export type FindModule<M extends Module> = ModuleTypeGuard<M> | ModuleConstructor<M> | M

export type FindScope = 'parents' | 'siblings' | 'children'

export type ModuleParent = Modules<readonly Module[]>

//// Errors ////

class InvalidParentError extends Error {
    constructor(readonly module: Module, msg: string) {
        super(`${msg}: _applyParent method should only be called internally.`)
    }
}

class ModuleNotFoundError extends Error {
    constructor(readonly input: FindModule<Module>, readonly scope: FindScope, readonly required: number) {
        const count = required === 1 
            ? '' 
            : ` in required amount (${required})`
        super(`Could not find ${toModuleName(input)} in scope ${scope}${count}`)
    }
}

//// Definition ////

class Module<S = unknown> implements CopyComparable {

    /**
     * @internal
     * Allows the find() method to differentiate between type guards and module constructors,
     * ensuring edge cases:
     * - modules extended by callable
     * - function () {} typeguards
     */
    protected static readonly [$$isModuleConstructor] = true
 
    //// State ////
    
    constructor(state: S) {
        this.state = state
    }

    readonly state: Readonly<S>

    /**
     * Create a copy of this module with a new state.
     */
    setState(state: S): this {
        const Constructor = this.constructor as new (state: S) => this
        return new Constructor(state)
    }

    //// Relationships ////

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
    _applyParent(parent: ModuleParent): void {

        if (this._parent)
            throw new InvalidParentError(this, 'Parent already set')

        if (!parent.modules.includes(this))
            throw new InvalidParentError(parent, 'Parent invalid')

        if (parent.modules.indexOf(this) !== parent.modules.lastIndexOf(this))
            throw new Error( 'Parent may only contain single reference of child')

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

    //// Find interface ////
    
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
        const requiredLength = isNumber(required) ? required : required ? 1 : 0
        if (!isInteger(requiredLength) || requiredLength < 0)
            throw new Error('required argument must be a positive integer')

        for (const scope of scopes) 
            this._findInScope(scope, predicate, found)

        // ensure required

        if (found.length < requiredLength) 
            throw new ModuleNotFoundError(input, scope, requiredLength)

        return found
    }

    has<M extends Module>(type: FindModule<M>, scope?: FindScope): boolean {
        return this.find(type, scope).length > 0
    }

    assert<M extends Module>(type: FindModule<M>, scope?: FindScope): void {
        void this.find(type, scope, true)
    }

    //// CopyComparable Interface ////

    [$$equals](input: unknown): input is this {
        return isObject(input) && 
            input instanceof Module && 
            input.constructor === this.constructor && 
            equals(this.state, input.state)
    }

    [$$copy](): this {
        return this.setState(copy(this.state))
    }

    //// Helper ////
    
    protected _findInScope(scope: FindScope, predicate: ModuleTypeGuard<Module>, found: Module[]): void {
        switch (scope) {

            case 'siblings': {
                const foundSiblings = this.siblings.filter(predicate)
                found.push(...foundSiblings)
                break
            }

            case 'parents': {
                if (this.parent && predicate(this.parent))
                    found.push(this.parent)

                if (this.parent) {
                    const foundAncestors = this.parent.find(predicate, ['siblings', 'parents'], false)
                    found.push(...foundAncestors)
                }
                break
            }

            case 'children': {

                // should only be the case for classes that extend Modules
                const hasChildren = !this.modules.includes(this)
                if (hasChildren) {  
                    const foundChildren = this
                        .modules
                        .filter(predicate)
                    
                    const childrenWithChildren = this
                        .modules
                        .filter(child => !child.modules.includes(child))
                    
                    const foundDescendants = childrenWithChildren
                        .flatMap(child => child.find(predicate, 'children', false))

                    found.push(
                        ...foundChildren, 
                        ...foundDescendants
                    )

                } else {
                    const siblingsWithChildren = this.siblings.filter(sibling => !sibling.modules.includes(sibling))
                    const foundDescendantsInSiblings = siblingsWithChildren.flatMap(sibling => sibling.find(predicate, 'children', false))
                    found.push(
                        ...foundDescendantsInSiblings
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
}

//// Helper ////

function isModuleConstructor<M extends Module>(input: TypeGuard<M, Module<unknown>> | ModuleConstructor<M>): input is ModuleConstructor<M> {
    return $$isModuleConstructor in input && !!input[$$isModuleConstructor]
}

function toModuleTypeGuard<M extends Module>(input: FindModule<M>): ModuleTypeGuard<M> {
    if (input instanceof Module) 
        return (other => equals(input, other)) as ModuleTypeGuard<M>
        
    if (isModuleConstructor(input))
        return (other => other instanceof input) as ModuleTypeGuard<M>

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