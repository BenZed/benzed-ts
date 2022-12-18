import { $$equals, equals } from '@benzed/immutable'
import { callable, isFunc, isNil, nil, TypeGuard } from '@benzed/util'

import Module, { $$isModuleConstructor } from './module'
import type { Modules } from './modules'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper ////

type ModuleConstructor = 
    (new (...args: any) => Module) | 
    (abstract new (...args: any) => Module)

type ModuleTypeGuard = TypeGuard<Module, Module>

type ModulePredicate = (input: Module) => Module | nil

export type FindInput = Module | ModulePredicate | ModuleTypeGuard | ModuleConstructor

export type FindOutput<F> = F extends (input: Module) => infer Mx 
    ? F extends TypeGuard<infer M , Module>   
        ? M 
        : Exclude<Mx, nil> 
    : F extends ModuleConstructor
        ? InstanceType<F>
        : F extends Module 
            ? F
            : Module<F>

//// FindModule ////

export interface FindModule {

    get require(): AssertModule
    get all(): FindModules

    <I extends FindInput>(state: I): FindOutput<I> | nil
    inDescendents<I extends FindInput>(state: I): FindOutput<I> | nil
    inChildren<I extends FindInput>(state: I): FindOutput<I> | nil
    inSiblings<I extends FindInput>(state: I): FindOutput<I> | nil
    inParents<I extends FindInput>(state: I): FindOutput<I> | nil
    inAncestors<I extends FindInput>(state: I): FindOutput<I> | nil
}

export interface HasModule {
    <I extends FindInput>(state: I): boolean
    inDescendents<I extends FindInput>(state: I): boolean
    inChildren<I extends FindInput>(state: I): boolean
    inSiblings<I extends FindInput>(state: I): boolean
    inParents<I extends FindInput>(state: I): boolean
    inAncestors<I extends FindInput>(state: I): boolean
}

//// AssertModule ////

export interface AssertModule {
    <I extends FindInput>(state: I): FindOutput<I>
    inDescendents<I extends FindInput>(state: I): FindOutput<I>
    inChildren<I extends FindInput>(state: I): FindOutput<I>
    inSiblings<I extends FindInput>(state: I): FindOutput<I>
    inParents<I extends FindInput>(state: I): FindOutput<I>
    inAncestors<I extends FindInput>(state: I): FindOutput<I>
}

//// FindModules ////

export interface FindModules {
    <I extends FindInput>(state: I): FindOutput<I>[]
    inDescendents<I extends FindInput>(state: I): FindOutput<I>[]
    inChildren<I extends FindInput>(state: I): FindOutput<I>[]
    inSiblings<I extends FindInput>(state: I): FindOutput<I>[]
    inParents<I extends FindInput>(state: I): FindOutput<I>[]
    inAncestors<I extends FindInput>(state: I): FindOutput<I>[]
}

//// Implementation ////

export enum FindFlag {
    Require,
    All,
    Has
}

interface FindConstructor {
    new (module: Module, flag?: FindFlag, error?: string): FindModule
}

const _Finder = callable(
    function find(input: FindInput) {
        return hasChildren(this.module)
            ? this.inChildren(input)
            : this.inSiblings(input)
    }, 
    class {

        constructor(
            readonly module: Module,
            private readonly _flag?: FindFlag,
            private readonly _error?: string
        ) { }

        get require(): FindModule {
            this._assertNoFlag()
            return new _Finder(this.module, FindFlag.Require, this._error) as FindModule
        }

        get all(): FindModules { 
            this._assertNoFlag()

            return new _Finder(this.module, FindFlag.All, this._error) as FindModules
        }

        inDescendents = (input: FindInput): unknown => this._find(
            hasChildren(this.module) ? this.module.eachDescendent() : nil,
            input
        )

        inChildren = (input: FindInput): unknown => this._find(
            hasChildren(this.module) ? this.module.eachChild() : nil,
            input 
        )

        inSiblings = (input: FindInput): unknown => this._find(
            this.module.eachSibling(),
            input
        )

        inParents = (input: FindInput): unknown => this._find(
            this.module.eachParent(),
            input
        )

        inAncestors = (input: FindInput): unknown => this._find(
            this.module.eachAncestor(),
            input
        )

        //// Helper ////

        private _find(iterator: IterableIterator<Module> | nil, input: FindInput): unknown {
            const predicate = toModulePredicate(input)

            const output: Module[] = []
            const { _flag: flag } = this

            if (iterator) {
                for (const module of iterator) {
                    const pass = predicate(module)
                    if (pass)
                        output.push(pass instanceof Module ? pass : module)
                    if (pass && flag !== FindFlag.All)
                        break
                }
            }

            const has = output.length > 0
            if (flag === FindFlag.Require && !has)
                throw new Error(this._error ?? `Could not find module ${toModuleName(input)}`)

            if (flag === FindFlag.All)
                return output

            if (flag === FindFlag.Has)
                return has

            return output.at(0)
        }

        private _assertNoFlag(): void {
            if (!isNil(this._flag) )
                throw new Error(`Find has ${FindFlag[this._flag]}`)
        }

    }, 'Finder')

export const Finder = _Finder as unknown as FindConstructor

//// Helper ////

function isModuleConstructor(input: FindInput): input is ModuleConstructor {
    return $$isModuleConstructor in input && !!input[$$isModuleConstructor]
}

function toModulePredicate(input: FindInput): ModuleTypeGuard | ModulePredicate {
    if (input instanceof Module) 
        return (other => input[$$equals](other)) as ModuleTypeGuard
        
    if (isModuleConstructor(input))
        return (other => other instanceof input) as ModuleTypeGuard

    if (isFunc(input))
        return input
        
    // basic state comparison
    return other => equals(input, other.state) ? other : nil
} 

function toModuleName({ name }: FindInput): string {
   
    // assume typeguard with convention isModuleName
    if (name.startsWith('is'))
        name = name.slice(0, 2)

    // assume anonymous typeguard
    if (!name)
        return Module.name

    return name
}

//// Helper ////

export function hasChildren(module: Module): module is Modules {
    return 'children' in module
}

