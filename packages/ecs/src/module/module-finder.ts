import { callable, isFunc, nil, TypeGuard } from '@benzed/util'
import { $$copy, $$equals, copy } from '@benzed/immutable'

import type { Node } from '../node'
import { $$isModuleConstructor, Module } from './module'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper ////

type ModuleConstructor = (new (...args: any[]) => Module) | (abstract new (...args: any[]) => Module)
type ModuleTypeGuard = TypeGuard<Module, Module>
type ModulePredicate = (input: Module) => Module | boolean

export type FindInput = Module | ModulePredicate | ModuleTypeGuard | ModuleConstructor
export type FindOutput<I> = 
    I extends TypeGuard<infer Mx, Module>   
        ? Mx 
        : I extends (input: Module) => infer M 
            ? Exclude<M, nil>
            : I extends ModuleConstructor
                ? InstanceType<I>
                : I extends Module 
                    ? I
                    : never

//// FindModule ////

export interface FindModule {

    <I extends FindInput>(input: I): FindOutput<I> | nil
    or: FindModule
    inSelf: FindModule
    inDescendents: FindModule
    inChildren: FindModule
    inParents: FindModule
    inAncestors: FindModule
}

export interface FindModules {
    <I extends FindInput>(input: I): FindOutput<I>[]
    or: FindModules
    inSelf: FindModules
    inDescendents: FindModules
    inChildren: FindModules
    inParents: FindModules
    inAncestors: FindModules
}

export interface HasModule {
    <I extends FindInput>(input: I): boolean
    or: HasModule
    inSelf: HasModule
    inDescendents: HasModule
    inChildren: HasModule
    inParents: HasModule
    inAncestors: HasModule
}

//// AssertNode ////

export interface AssertModule {
    <I extends FindInput>(input: I, error?: string): FindOutput<I>
    or: AssertModule
    inSelf: AssertModule
    inDescendents: AssertModule
    inChildren: AssertModule
    inParents: AssertModule
    inAncestors: AssertModule
}

//// Implementation ////

export enum FindFlag {
    Assert = 'assert',
    Has = 'has',
    All = 'all'
}

interface ModuleFinderConstructor {
    new (node: Node): FindModule
    new (node: Node, flag: FindFlag.All): FindModules
    new (node: Node, flag: FindFlag.Assert): AssertModule
    new (node: Node, flag: FindFlag.Has): HasModule
}

export const ModuleFinder = callable(

    function find(input: FindInput, error?: string) {
        return this._find(input, error)
    },

    class {

        constructor(
            readonly node: Node,
            private readonly _flag?: FindFlag
        ) { 
            this._iterators = [[node]]
        }

        //// Interface ////

        get or(): this {
            this._iteratorMergeOnIncrement = true 
            return this
        }

        get inSelf(): this {
            return this._iteratorIncrement([this.node])
        }

        get inDescendents(): this {
            return this._iteratorIncrement(this.node.eachDescendent())
        }

        get inChildren(): this{
            return this._iteratorIncrement(this.node.eachChild())
        }

        get inParents(): this {
            return this._iteratorIncrement(this.node.eachParent())
        }

        get inAncestors(): this {
            return this._iteratorIncrement(this.node.eachAncestor())
        }

        //// Helper ////

        /**
         * @internal
         */
        _find(input: FindInput, error?: string): unknown {
            const predicate = toModulePredicate(input)

            const found: Module[] = []
            const { _flag: flag } = this

            iterators: for (const iterator of this._iterators) {
                for (const node of iterator) {
                    for (const module of node.modules) {
                        if (found.includes(module))
                            continue
                        const pass = predicate(module)
                        if (pass)
                            found.push(Module.isModule(pass) ? pass : module)
                        if (pass && flag !== FindFlag.All)
                            break iterators
                    }
                }
            }

            const has = found.length > 0
            if (flag === FindFlag.Assert && !has)
                throw new Error(error ?? `Could not find module ${toModuleName(input)}`)

            if (flag === FindFlag.Has)
                return has

            if (flag === FindFlag.All)
                return found

            return found.at(0)
        }

        //// Iterators ////
        
        private readonly _iterators: Iterable<Node>[]
        private _iteratorMergeOnIncrement = false
        private _iteratorIncrement(iterator: Iterable<Node>): this {
            const next = copy(this)
            next._iterators.length = 0 

            if (this._iteratorMergeOnIncrement)
                next._iterators.push(...this._iterators)
        
            next._iterators.push(iterator)
            return next
        }

        //// Copy ////

        [$$copy](): this {
            const Constructor = this.constructor as new (node: Node, flag?: FindFlag) => this
            return new Constructor(this.node, this._flag)
        }

    }, 
    'ModuleFinder'
) as ModuleFinderConstructor

//// Helper ////

function isModuleConstructor(input: FindInput): input is ModuleConstructor {
    return $$isModuleConstructor in input && !!input[$$isModuleConstructor]
}

function toModulePredicate(input: FindInput): ModuleTypeGuard | ModulePredicate {
        
    if (isModuleConstructor(input)) {
        return (other => callable.isInstance(
            other, 
            input as new () => Module
        )) as ModuleTypeGuard
    }

    if (Module.isModule(input)) 
        return (other => input[$$equals](other)) as ModuleTypeGuard

    if (isFunc(input))
        return input
        
    throw new Error('Invalid find input.')
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

