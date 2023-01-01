import { copy } from '@benzed/immutable'
import { IndexesOf } from '@benzed/util'

import Node, { Nodes } from './node'

import { 
    SetNode, 
    RemoveNode,  

    GetNodeAtPath,
    NestedPathsOf, 
    PathsOf,

    _setNodeAtPath, 
} from './operations'

import { 
    Module, 
    Modules,    
    AddModules, 
    InsertModules, 
    RemoveModule, 
    SetModule,
    SwapModules,
} from '../module'

/* eslint-disable 
    @typescript-eslint/ban-types,
    @typescript-eslint/no-explicit-any
*/

//// Helper Types ////

type _SetNodeBuilderAtNestedPath<N extends Nodes, P extends string, Nx extends Node<Modules, Nodes>> = 
    P extends `${infer Px}/${infer Pxr}`
        ? {
            [K in PathsOf<N> | Px]: Px extends K 
                ? N[Px] extends Node<infer M, infer Nxx> 
                    ? NodeBuilder<M, _SetNodeBuilderAtNestedPath<Nxx, Pxr, Nx>>
                    : NodeBuilder<[], _SetNodeBuilderAtNestedPath<{}, Pxr, Nx>>
                : N[K]
        }
        : SetNode<N, P, Nx>

//// Types ////

export type SetNodeBuilderAtPath<
    N extends Nodes, 
    P extends string, 
    Nx extends Node<Modules, Nodes>
> = 
    _SetNodeBuilderAtNestedPath<N, P, Nx>

//// Export ////

/**
 * A node with the full set of Node operations as member methods, for convenience.
 */
class NodeBuilder<M extends Modules = any, N extends Nodes = any> extends Node<M,N> {

    static create<Nx extends Nodes, Mx extends Modules>(nodes: Nx, ...modules: Mx): NodeBuilder<Mx, Nx>
    static create<Mx extends Modules>(...modules: Mx): NodeBuilder<Mx, {}>
    static create(...args: unknown[]): unknown {
        return new NodeBuilder(...this._sortConstructorParams(args, Module, Node))
    }

    //// Module Build Interface ////

    addModule<Mx extends Module>(module: Mx): NodeBuilder<AddModules<M, [Mx]>, N> {
        return this.addModules(module)
    }

    addModules<Mx extends Modules>(...modules: Mx): NodeBuilder<AddModules<M, Mx>, N> {
        return this.setModules(
            ...Module.add(this.modules, ...modules)
        )
    }

    setModule<
        I extends IndexesOf<M>,
        F extends ((input: M[I]) => Module)
    >(index: I, update: F): NodeBuilder<SetModule<M, I, ReturnType<F>>, N>
    setModule<
        I extends IndexesOf<M>,
        Mx extends Module,
    >(
        index: I,
        module: Mx
    ): NodeBuilder<SetModule<M, I, Mx>, N>

    setModule(index: number, module: Module | ((input: Module) => Module)): NodeBuilder {
        return this.setModules(
            ...Module.set(this.modules, index as IndexesOf<M>, module as Module)
        )
    }

    setModules<Mx extends Modules>(...modules: Mx): NodeBuilder<Mx, N> {
        return new NodeBuilder(
            copy(this.nodes),
            ...modules
        ) as unknown as NodeBuilder<Mx, N>
    }

    insetModule<Mx extends Module, I extends IndexesOf<M>>(index: I, module: Mx): NodeBuilder<InsertModules<M,I,[Mx]>,N> {
        return this.insertModules(index, module)
    }

    insertModules<Mx extends Modules, I extends IndexesOf<M>>(index: I, ...modules: Mx): NodeBuilder<InsertModules<M, I, Mx>, N> {
        return this.setModules(
            ...Module.insert(this.modules, index, ...modules)
        )
    }

    swapModules<A extends IndexesOf<M>, B extends IndexesOf<M>>(indexA: A, indexB: B): NodeBuilder<SwapModules<M,A,B>, N> {
        return this.setModules(
            ...Module.swap(this.modules, indexA, indexB)
        )
    }

    removeModule<I extends IndexesOf<M>>(index: I): NodeBuilder<RemoveModule<M, I>, N> {
        return this.setModules(
            ...Module.remove(this.modules, index)
        )
    }

    //// Node Build Interface ////
    
    setNode<K extends string, Nx extends Node>(key: K, node: Nx): NodeBuilder<M, SetNodeBuilderAtPath<N, K, Nx>> 
    setNode<K extends NestedPathsOf<N>, F extends (input: GetNodeAtPath<N, K>) => NodeBuilder<Modules,Nodes>>(
        key: K, 
        update: F
    ): NodeBuilder<M, SetNodeBuilderAtPath<N, K, ReturnType<F>>>
    setNode(key: string, node: Node | ((current: Node) => Node)): NodeBuilder {

        const missingNodePathTemplate = new NodeBuilder({})

        return this.setNodes(
            _setNodeAtPath(
                this.nodes, 
                key,
                node as NodeBuilder, 
                missingNodePathTemplate
            )
        )
    }

    removeNode<K extends PathsOf<N>>(key: K): NodeBuilder<M, RemoveNode<N, K>> {
        return this.setNodes(
            Node.remove(this.nodes, key)
        )
    }

    setNodes<Nx extends Nodes>(nodes: Nx): NodeBuilder<M, Nx> {
        return new NodeBuilder(nodes, ...copy(this.modules)) as unknown as NodeBuilder<M, Nx>
    }
    
}

//// Exports ////

export default NodeBuilder

export {
    NodeBuilder
}