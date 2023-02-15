import { assign, Callable, Func, isFunc, nil, Property, TypeGuard } from '@benzed/util'

import { $$equals } from '../equals'

import { Module } from './module'

import { 
    eachAncestor, 
    eachChild, 
    eachDescendent, 
    eachModule, 
    eachParent, 
    getPath 
} from './relations'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper Types////

type AnyModuleConstructor = (new (...args: any[]) => Module) | (abstract new (...args: any[]) => Module)
type AnyModuleTypeGuard = TypeGuard<Module, Module>
type AnyModulePredicate = (input: Module) => Module | boolean

//// Types ////

type FindInput = Module | AnyModulePredicate | AnyModuleTypeGuard | AnyModuleConstructor
type FindOutput<I> = 
    I extends TypeGuard<infer Mx, Module>   
        ? Mx 
        : I extends (input: Module) => infer M 
            ? Exclude<M, nil>
            : I extends AnyModuleConstructor
                ? InstanceType<I>
                : I extends Module 
                    ? I
                    : never

interface FindModule {

    <I extends FindInput>(input: I): FindOutput<I> | nil
    get inSelf(): FindModule
    get inDescendents(): FindModule
    get inChildren(): FindModule
    get inParents(): FindModule
    get inAncestors(): FindModule
    get inModules(): FindModule
    get or(): FindModule
    get all(): FindModules

}

interface FindModules {
    <I extends FindInput>(input: I): FindOutput<I>[]
    get inSelf(): FindModules
    get inDescendents(): FindModules
    get inChildren(): FindModules
    get inParents(): FindModules
    get inAncestors(): FindModules
    get inModules(): FindModules
    get or(): FindModules
}

interface HasModule {
    <I extends FindInput>(input: I): boolean
    get inSelf(): HasModule
    get inDescendents(): HasModule
    get inChildren(): HasModule
    get inParents(): HasModule
    get inAncestors(): FindModules
    get inModules(): FindModules
    get or(): HasModule
}

interface AssertModule {
    <I extends FindInput>(input: I, error?: string): FindOutput<I>
    get inSelf(): AssertModule
    get inDescendents(): AssertModule
    get inChildren(): AssertModule
    get inParents(): AssertModule
    get inAncestors(): AssertModule
    get inModules(): AssertModule
    get or(): AssertModule
}

interface FindConstructor {
    new (source: Module): FindModule
    new (source: Module, flag: FindFlag.All): FindModules
    new (source: Module, flag: FindFlag.Assert): AssertModule
    new (source: Module, flag: FindFlag.Has): HasModule
}

enum FindFlag {
    Assert = 0,
    Has = 1,
    All = 2
}

//// Implementation ////

const Find = class ModuleFinder extends Callable<Func> {

    constructor(
        readonly source: Module,
        private readonly _flag?: FindFlag
    ) { 
        super(function find(this: ModuleFinder, input: FindInput, error?: string) {
            return this._find(input, error)
        })
        this._iterators = [[source]]
    }

    //// Interface ////

    get or(): this {
        this._iteratorMergeOnIncrement = true 
        return this
    }

    get all(): this {
        const next = this._iteratorIncrement()
        assign(next, { _flag: FindFlag.All })
        return next
    }

    get inSelf(): this {
        return this._iteratorIncrement([this.source])
    }

    get inDescendents(): this {
        return this._iteratorIncrement(eachDescendent(this.source))
    }

    get inChildren(): this{
        return this._iteratorIncrement(eachChild(this.source))
    }

    get inParents(): this {
        return this._iteratorIncrement(eachParent(this.source))
    }

    get inAncestors(): this {
        return this._iteratorIncrement(eachAncestor(this.source))
    }

    get inModules(): this {
        return this._iteratorIncrement(eachModule(this.source))
    }

    //// Helper ////

    /**
     * @internal
     */
    _find(input: FindInput, error?: string): unknown {
        const predicate = toModulePredicate(input)

        const found = new Set<Module>()
        const { _flag: flag } = this

        iterators: for (const iterator of this._iterators) {
            for (const module of iterator) {
                for (const child of eachChild(module)) {

                    if (found.has(child))
                        continue

                    const pass = predicate(child)
                    if (pass)
                        found.add(Module.is(pass) ? pass : child)
                    if (pass && flag !== FindFlag.All)
                        break iterators
                }
            }
        }

        const has = found.size > 0
        if (flag === FindFlag.Assert && !has) {
            throw new Error(
                error ?? `Node ${getPath(this.source).join('/')} Could not find module ${toModuleName(input)}`
            )
        }

        if (flag === FindFlag.Has)
            return has

        if (flag === FindFlag.All)
            return Array.from(found)

        const [first] = found
        return first
    }

    //// Iterators ////
        
    private readonly _iterators: Iterable<Module>[]
    private _iteratorMergeOnIncrement = false
    private _iteratorIncrement(...iterators: Iterable<Module>[]): this {
        const next = new ModuleFinder(this.source, this._flag) as this
        next._iterators.length = 0 

        if (this._iteratorMergeOnIncrement)
            next._iterators.push(...this._iterators)
        
        next._iterators.push(...iterators)
        return next
    }

} as FindConstructor

//// Helper ////

function isModuleConstructor(input: FindInput): input is AnyModuleConstructor {
    return Property.prototypesOf(input).includes(Module)
}

function toModulePredicate(input: FindInput): AnyModuleTypeGuard | AnyModulePredicate {

    if (isModuleConstructor(input)) 
        return (other => other instanceof input) as AnyModuleTypeGuard

    if (Module.is(input)) 
        return (other => input[$$equals](other)) as AnyModuleTypeGuard

    if (isFunc(input))
        return input
        
    throw new Error('Invalid find input.')
} 

function toModuleName(input: FindInput): string {
  
    let name = 'name' in input ? input.name : ''

    // assume typeguard with convention isModuleName
    if (name.startsWith('is'))
        name = name.slice(0, 2)

    // assume anonymous typeguard
    if (!name)
        return Module.name

    return name
}

//// Exports ////

export default Find

export {

    Find,
    FindFlag,
    FindConstructor,
    FindInput,
    FindOutput,

    FindModule,
    FindModules,
    HasModule,
    AssertModule,
}