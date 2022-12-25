
import { 
    callable,
    IndexesOf,
    isString, 
    iterate, 
    KeysOf, 
    keysOf, 
    Mutable, 
    nil,
} from '@benzed/util'

import { Module, Modules } from './module'

import { 
    AssertModule, 
    ModuleFinder, 
    FindFlag, 
    FindInput, 
    FindModule, 
    FindOutput, 
    HasModule 
} from './module-finder'

import { $$copy, $$equals, copy, CopyComparable, equals } from '@benzed/immutable'
import { Validatable } from './validatable'

import { 
    addModules, 
    AddModules, 
    insertModules, 
    InsertModules, 
    removeModule, 
    RemoveModule, 
    setModule, 
    SetModule,
    swapModules, 
    SwapModules,
    setNode, 
    SetNode, 
    removeNode, 
    RemoveNode,  
} from './operations'

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Exports ////

type Nodes = { readonly [key: string]: Node }

class Node<M extends Modules = Modules, N extends Nodes = {}> extends Validatable implements CopyComparable {

    static isNode(input: unknown): input is Node {
        return callable.isInstance(input, Node as unknown as (new () => Node))
    }

    constructor(nodes: N)
    constructor(nodes: N, ...modules: M)
    constructor(...modules: M)
    constructor(args: [N] | M | [N, ...M]) {

        super()

        const [nodes, ...modules] = Module.isModule(args[0])
            ? [{}, ...args]
            : args

        this.nodes = nodes as N
        this.modules = modules as unknown as M

        for (const name of keysOf(this.nodes)) {
            const child = this.nodes[name] as Node
            child._setParent(name, this)
        }

        for (const module of this.modules)
            (module as Module)._setNode(this)

    }

    private _name: string = this.constructor.name
    get name(): string {
        return this._name
    }

    //// Operations ////

    getNode<K extends KeysOf<N>>(name: K): N[K] {
        return this.nodes[name]
    }

    setNode<K extends string, Nx extends Node>(key: K, node: Nx): Node<M, SetNode<N, K, Nx>> 
    setNode<K extends KeysOf<N>, F extends (input: N[K]) => Node>(key: K, update: F): Node<M, SetNode<N, K, ReturnType<F>>>
    setNode(key: string, node: Node | ((current: Node) => Node)): Node {
        return new Node(
            setNode(this.nodes, key as KeysOf<N>, node as Node),
            ...copy(this.modules)
        )
    }

    removeNode<K extends KeysOf<N>>(key: K): Node<M, RemoveNode<N, K>> {
        return new Node(
            removeNode(this.nodes, key),
            ...copy(this.modules)
        ) 
    }

    getModule<I extends IndexesOf<M>>(index: I): M[I] {
        return this.modules[index]
    }

    addModules<Mx extends Modules>(...modules: Mx): Node<AddModules<M, Mx>, N> {
        return new Node(
            this.nodes,
            ...addModules(this.modules, ...modules)
        )
    }

    setModule<
        I extends IndexesOf<M>,
        F extends ((input: M[I]) => Module)
    >(index: I, update: F): Node<SetModule<M, I, ReturnType<F>>, N>
    setModule<
        I extends IndexesOf<M>,
        Mx extends Module,
    >(
        index: I,
        module: Mx
    ): Node<SetModule<M, I, Mx>, N>
    setModule(index: number, module: Module | ((input: Module) => Module)): Node {
        return new Node(
            this.nodes,
            ...setModule(this.modules, index as IndexesOf<M>, module as Module)
        )
    }

    insertModules<Mx extends Modules, I extends IndexesOf<M>>(index: I, ...modules: Mx): Node<InsertModules<M, I, Mx>, N> {
        return new Node(
            this.nodes,
            ...insertModules(this.modules, index, ...modules)
        )
    }

    swapModules<A extends IndexesOf<M>, B extends IndexesOf<M>>(indexA: A, indexB: B): Node<SwapModules<M,A,B>, N> {
        return new Node(
            this.nodes,
            ...swapModules(this.modules, indexA, indexB)
        )
    }

    removeModule<I extends IndexesOf<M>>(index: I): Node<RemoveModule<M, I>, N> {
        return new Node(
            this.nodes,
            ...removeModule(this.modules, index)
        )
    }

    //// Relationships ////

    private _parent: Node | nil = nil
    get parent(): Node {
        if (!this._parent)
            throw new Error(`${this.name} does not have a parent. Use .hasParent to check, first.`)

        return this._parent
    }
    get hasParent(): boolean {
        return !!this._parent
    }

    /**
     * @internal
     */
    _setParent(name: string, parent: Node): void {
        if (this._parent)
            throw new Error(`${this.name} is already parented`)

        if (!parent.children.includes(this)) 
            throw new Error(`${this.name} is not included in given parent\'s children.`)

        this._name = name
        this._parent = parent
        this.validate()
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

    * eachAncestor(): IterableIterator<Node> {
        for (const parent of this.eachParent()) {
            if (parent.parent)
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
        yield* iterate(this.children)
    }

    readonly nodes: N

    get children(): Node[] {
        return Array.from(iterate(this.nodes))
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
    get hasModule(): HasModule {
        return new ModuleFinder(this, FindFlag.Has)
    }
    assertModule<T extends FindInput>(input: T): FindOutput<T>
    assertModule(error?: string): AssertModule
    assertModule(input?: FindInput | string): FindOutput<FindInput> | AssertModule {

        const isError = isString(input)
        const error = isError ? input : undefined

        const finder = new ModuleFinder(this, FindFlag.Require, error)

        const isFindInput = !isError && input
        return (isFindInput ? finder(input) : finder) as FindOutput<FindInput> | AssertModule
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

    /// CopyComparable /// 

    [$$copy](): this {

        const Node = this.constructor as new (children: N, ...modules: M) => Node<M,N>

        return new Node(
            copy(this.nodes),
            ...copy(this.modules)
        ) as this
    }

    [$$equals](other: unknown): other is this {
        return Node.isNode(other) && 
            other.constructor === this.constructor && 
            equals(other.modules, this.modules) && 
            equals(other.children, this.children)
    }
}

//// Exports ////

export default Node 

export {
    Node,
    Nodes
}