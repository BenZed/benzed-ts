
import { 
    callable,
    isRecord,
    generate, 
    keysOf,
    nil,
} from '@benzed/util'

import { 
    $$copy, 
    $$equals, 
    copy,
    equals, 
    CopyComparable 
} from '@benzed/immutable'

import { IndexValue, pluck } from '@benzed/array'

import { 
    Module, 
    Modules,
} from '../module'

import { 
    AssertModule, 
    ModuleFinder, 
    FindFlag, 
    FindModule, 
    HasModule, 
    FindModules
} from '../module/module-finder'

import { GetNodeAtPath, NestedPathsOf, removeNode, setNode } from './operations'

import type NodeBuilder from './node-builder'
import ModuleInterface from '../module/module-interface'

/* eslint-disable 
    @typescript-eslint/ban-types,
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/no-this-alias,
    @typescript-eslint/no-var-requires
*/

//// Exports ////

type Nodes = { readonly [key: string]: Node }

type NodesOf<N extends Node> = N extends Node<any, infer Nx> ? Nx : {}

type ModulesOf<N extends Node> = N extends Node<infer M, any> ? M : []

class Node<M extends Modules = any, N extends Nodes = any> implements CopyComparable {

    static create<Nx extends Nodes, Mx extends Modules>(nodes: Nx, ...modules: Mx): Node<Mx, Nx>
    static create<Mx extends Modules>(...modules: Mx): Node<Mx, {}>
    static create(...args: unknown[]): unknown {
        return new Node(...this._sortConstructorParams(args))
    }

    static build<Nx extends Nodes, Mx extends Modules>(nodes: Nx, ...modules: Mx): NodeBuilder<Mx, Nx>
    static build<Mx extends Modules>(...modules: Mx): NodeBuilder<Mx, {}>
    static build<Nx extends Node>(node: Nx): NodeBuilder<ModulesOf<Nx>, NodesOf<Nx>>
    static build(...args: unknown[]): unknown {
        const NodeBuilder = require('./node-builder').NodeBuilder
        return new NodeBuilder(...this._sortConstructorParams(args))
    }

    /**
     * Given an array of unknown values, receive an array of nodes and modules.
     * @internal
     */
    static _sortConstructorParams<
        M extends typeof Module = typeof Module, 
        N extends typeof Node = typeof Node
    >(
        params: unknown[], 
        ModuleConstructor?: M, 
        NodeConstructor?: N
    ): [ { [key: string]: InstanceType<N> }, ...readonly InstanceType<M>[]] {

        const node = Node.isNode(params[0]) 
            ? params[0]
            : nil

        const modules = pluck(
            node ? copy(node.modules) : params, 
            (p: unknown): p is InstanceType<M> => callable.isInstance(p, ModuleConstructor ?? Module as M)
        )

        const [nodes = {}] = pluck(
            node ? copy([node.nodes]) : params, 
            (p: unknown): p is Record<string, InstanceType<N>> => isRecord(
                p, 
                (n): n is InstanceType<N> => callable.isInstance(n, NodeConstructor ?? Node as N)
            )
        )
    
        return [nodes, ...modules]
    }

    static isNode(input: unknown): input is Node<Modules, Nodes> {
        return callable.isInstance(input, Node as unknown as (new () => Node))
    }

    static set = setNode
    static remove = removeNode

    //// Constructor ////
    
    constructor(nodes: N, ...modules: M) {
        this.nodes = nodes
        for (const child of this.eachChild())
            child._setParent(this)

        this.modules = modules
        for (const module of this.modules)
            module._setNode(this)

        this.validate()
    }

    get name(): string {
        return this.hasParent 
            ? this.getPathFrom(this.parent)
            : Node.name
    }
    
    //// Relationships ////

    readonly nodes: N

    getNode<K extends NestedPathsOf<N>>(path: K): GetNodeAtPath<N,K> {

        const paths = path.split('/')

        const node = paths.reduce<Node | nil>((n, p) => n?.nodes[p], this as Node)
        if (!node)
            throw new Error(`No node at path: ${path}`)
        
        return node as GetNodeAtPath<N,K>
    }

    get parent(): Node<Modules, Nodes> {
        const parent = Module._refs.get(this)
        if (!parent)
            throw new Error(`${this.name} does not have a parent.`)

        return parent
    }
    get hasParent(): boolean {
        return Module._refs.has(this)
    }

    /**
     * @internal
     */
    _setParent(parent: Node): void {

        if (parent.children.indexOf(this) !== parent.children.lastIndexOf(this)) 
            throw new Error(`${parent} may only have a single reference of ${this}`)

        if (this.hasParent)
            throw new Error(`${this} is already parented`)

        if (!parent.children.includes(this)) 
            throw new Error(`${this} is not included in given parent\'s children.`)

        Module._refs.set(this, parent)
    }
    
    * eachParent(): IterableIterator<Node> {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let current: Node = this
        while (current.hasParent) {
            yield current.parent
            current = current.parent
        }
    }

    get parents(): Node[] {
        return Array.from(this.eachParent())
    }

    get numParents(): number {
        return this.parents.length
    }

    get root(): Node {
        return this.parents.at(-1) ?? this
    }

    get isRoot(): boolean {
        return this === this.root
    }

    get path(): string {
        return this.getPathFromRoot()
    }

    getPathFrom(ancestor: Node): string {

        if (!this.parents.includes(ancestor))
            throw new Error(`${this.name} is not a descendant of ${ancestor.name}`)

        const path: string[] = []

        let cursor: Node = this
        while (cursor.hasParent && cursor !== ancestor) {
            const nodes = cursor.parent.nodes as Nodes
            for (const name of keysOf(nodes)) {
                if (nodes[name] === cursor) {
                    path.push(name)
                    break
                }
            }
            cursor = cursor.parent
        }

        return path.reverse().join('/')
    }

    getPathFromRoot(): string {
        return this.getPathFrom(this.root)
    }
    
    * eachAncestor(): IterableIterator<Node> {
        for (const parent of this.eachParent()) {
            if (parent.hasParent)
                yield* parent.parent.eachChild()
            else 
                yield parent
        }
    }
    get ancestors(): Node[] {
        return Array.from(this.eachAncestor())
    } 
    get numAncestors(): number {
        return this.ancestors.length
    }

    * eachChild(): IterableIterator<Node> {
        yield* generate(this.nodes)
    }
    get children(): Node[] {
        return Array.from(this.eachChild())
    }
    get numChildren(): number {
        return this.children.length
    }
    get hasChildren(): boolean {
        return this.numChildren > 0
    }

    * eachDescendent(): IterableIterator<Node> {
        for (const child of this.eachChild()) {
            yield child
            yield* child.eachDescendent()
        }
    }
    get descendents(): Node[] {
        return Array.from(this.eachDescendent())
    }
    get numDescendents(): number {
        return this.descendents.length
    }

    //// Modules ////
    
    readonly modules: M

    get findModule(): FindModule {
        return new ModuleFinder(this)
    }
    get findModules(): FindModules {
        return new ModuleFinder(this, FindFlag.All)
    }
    get hasModule(): HasModule {
        return new ModuleFinder(this, FindFlag.Has)
    }
    get assertModule(): AssertModule {
        return new ModuleFinder(this, FindFlag.Assert)
    }

    get module(): ModuleInterface<M> {
        return new ModuleInterface(this)
    }
    
    //// Validate ////

    /**
     * Called when the module is parented.
     */
    validate(): void {
        for (const module of this.modules)
            module.validate()

        for (const child of this.eachChild())
            child.validate()
    }

    //// Stringify ////

    toString(): string {
        return !this.name || this.name === Node.name ? Node.name : Node.name + ` "${this.name}"`
    }
    
    /// CopyComparable /// 

    [$$copy](): this {
        const NodeConstructor = this.constructor as new (nodes: Nodes, ...modules: Modules) => this

        const nodes = copy(this.nodes)
        const modules = copy(this.modules)

        return new NodeConstructor(nodes, ...modules) as Node<M,N> as this
    }

    [$$equals](other: unknown): other is this {
        return Node.isNode(other) && 
            other.constructor === this.constructor && 
            equals(other.modules, this.modules) && 
            equals(other.children, this.children)
    }

    * [Symbol.iterator](): IterableIterator<Node> {
        yield* this.children
    }
}

//// Exports ////

export default Node 

export {
    Node,
    Nodes,
    NodesOf,
    ModulesOf
}