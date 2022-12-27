import { callable, isFunc, isNil, nil, TypeGuard } from '@benzed/util'
import { $$equals } from '@benzed/immutable'

import Node from './node'
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
        ? I extends (input: Module) => infer M 
            ? Exclude<M, nil>
            : Mx 
        : I extends ModuleConstructor
            ? InstanceType<I>
            : I extends Module 
                ? I
                : never

//// FindModule ////

export interface FindModule {

    get require(): AssertModule
    get all(): FindModules

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
    <I extends FindInput>(input: I): FindOutput<I>
    inDescendents<I extends FindInput>(input: I): FindOutput<I>
    inChildren<I extends FindInput>(input: I): FindOutput<I> 
    inParents<I extends FindInput>(input: I): FindOutput<I>
    inAncestors<I extends FindInput>(input: I): FindOutput<I>
}

//// Implementation ////

export enum FindFlag {
    Require,
    Has,
    All
}

interface ModuleFinderConstructor {
    new (node: Node, flag: FindFlag.Require, error?: string): AssertModule
    new (node: Node, flag: FindFlag.Has, error?: string): HasModule
    new (node: Node, flag: FindFlag.All, error?: string): FindModules
    new (node: Node): FindModule
}

export const ModuleFinder = callable(

    function find(input: FindInput) {
        return this._find([this.node], input)
    },

    class {

        constructor(
            readonly node: Node,
            private readonly _flag?: FindFlag,
            private readonly _error?: string
        ) { }

        get require(): FindModule {
            this._assertNoFlag()
            return new ModuleFinder(
                this.node, 
                FindFlag.Require, 
                this._error
            ) as FindModule
        }

        get all(): FindModules {
            this._assertNoFlag()
            return new ModuleFinder(
                this.node,
                FindFlag.All,
                this._error
            ) as FindModules
        }

        inDescendents = (input: FindInput): unknown => this._find(
            this.node.eachDescendent(),
            input,
        )

        inChildren = (input: FindInput): unknown => this._find(
            this.node.eachChild(),
            input,
        )

        inParents = (input: FindInput): unknown => this._find(
            this.node.eachParent(),
            input,
        )

        inAncestors = (input: FindInput): unknown => this._find(
            this.node.eachAncestor(),
            input,
        )

        //// Helper ////

        /**
         * @internal
         */
        _find(iterator: Iterable<Node>, input: FindInput): unknown {
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
            if (flag === FindFlag.Require && !has)
                throw new Error(this._error ?? `Could not find module ${toModuleName(input)}`)

            if (flag === FindFlag.Has)
                return has

            if (flag === FindFlag.All)
                return output

            return output.at(0)
        }

        private _assertNoFlag(): void {
            if (!isNil(this._flag) )
                throw new Error(`Find has ${FindFlag[this._flag]}`)
        }

    }, 
    'Finder'
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
        return Node.name

    return name
}

