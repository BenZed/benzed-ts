import { callable, isFunc, nil, TypeGuard } from '@benzed/util'
import { $$equals } from '@benzed/immutable'

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
    inDescendents<I extends FindInput>(input: I): FindOutput<I> | nil
    inChildren<I extends FindInput>(input: I): FindOutput<I> | nil
    inParents<I extends FindInput>(input: I): FindOutput<I> | nil
    inAncestors<I extends FindInput>(input: I): FindOutput<I> | nil
}

export interface FindModules {
    <I extends FindInput>(input: I): FindOutput<I>[]
    inDescendents<I extends FindInput>(input: I): FindOutput<I>[]
    inChildren<I extends FindInput>(input: I): FindOutput<I>[]
    inParents<I extends FindInput>(input: I): FindOutput<I>[]
    inAncestors<I extends FindInput>(input: I): FindOutput<I>[]
}

export interface HasModule {
    <I extends FindInput>(input: I): boolean
    inDescendents<I extends FindInput>(input: I): boolean
    inChildren<I extends FindInput>(input: I): boolean
    inParents<I extends FindInput>(input: I): boolean
    inAncestors<I extends FindInput>(input: I): boolean
}

//// AssertNode ////

export interface AssertModule {
    <I extends FindInput>(input: I, error?: string): FindOutput<I>
    inDescendents<I extends FindInput>(input: I, error?: string): FindOutput<I>
    inChildren<I extends FindInput>(input: I, error?: string): FindOutput<I> 
    inParents<I extends FindInput>(input: I, error?: string): FindOutput<I>
    inAncestors<I extends FindInput>(input: I, error?: string): FindOutput<I>
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
        return this._find([this.node], input, error)
    },

    class {

        constructor(
            readonly node: Node,
            private readonly _flag?: FindFlag
        ) { }

        inDescendents(input: FindInput, error?: string): unknown {
            return this._find(
                this.node.eachDescendent(),
                input,
                error
            )
        }

        inChildren(input: FindInput, error?: string): unknown {
            return this._find(
                this.node.eachChild(),
                input,
                error
            )
        }

        inParents(input: FindInput, error?: string): unknown {
            return this._find(
                this.node.eachParent(),
                input,
                error
            )
        }

        inAncestors(input: FindInput, error?: string): unknown {
            return this._find(
                this.node.eachAncestor(),
                input,
                error
            )
        }

        //// Helper ////

        /**
         * @internal
         */
        _find(iterator: Iterable<Node>, input: FindInput, error?: string): unknown {
            const predicate = toModulePredicate(input)

            const output: Module[] = []
            const { _flag: flag } = this

            nodes: for (const node of iterator) {
                for (const module of node.modules) {
                    const pass = predicate(module)
                    if (pass)
                        output.push(Module.isModule(pass) ? pass : module)
                    if (pass && flag !== FindFlag.All)
                        break nodes
                }
            }

            const has = output.length > 0
            if (flag === FindFlag.Assert && !has)
                throw new Error(error ?? `Could not find module ${toModuleName(input)}`)

            if (flag === FindFlag.Has)
                return has

            if (flag === FindFlag.All)
                return output

            return output.at(0)
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

