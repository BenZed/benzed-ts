
import { IndexesOf, isNumber } from '@benzed/util'
import { 

    Modules, 
    ModulesInterface,

    AddModules,
    SwapModules,
    RemoveModule,
    SetModule,
    InsertModule,
    GetModule,

} from '../modules'

import {     
    Module, 
    ModuleArray, 
} from '../module'

import { 
    GetNodeAtPath, 
    PathsOf, 
    path,
    NestedPathsOf,
    GetNodeAtNestedPath,
    ToPath
} from './path'

import { 
    getNodeAtPath, 
    RemoveNodeAtPath, 
    removeNodeAtPath, 
    SetNodeAtPath, 
    setNodeAtPath 
} from './operations'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Definition ////

interface NodeInterface<M extends ModuleArray> extends Modules<M> {
    
    add<Mx extends ModuleArray>(...modules: Mx): Node<AddModules<M, Mx>>

    insert<Mx extends ModuleArray, I extends IndexesOf<M>>(index: I, ...modules: Mx): Node<InsertModule<M, I, Mx>>

    set<F extends (input: M[I]) => Module, I extends IndexesOf<M>>(index: I, initalizer: F): Node<SetModule<M, I, ReturnType<F>>>
    set<Mx extends Module, I extends IndexesOf<M>>( index: I, module: Mx): Node<SetModule<M, I, Mx>>
    set<F extends (input: GetNodeAtPath<M, P>) => Node<any>, P extends PathsOf<M>>(
        path: P, initializer: F
    ): Node<SetNodeAtPath<M, ToPath<P>, ReturnType<F>>>
    set<N extends Node<any>, P extends path>(path: P, node: N): Node<SetNodeAtPath<M, P, N>>

    get<I extends IndexesOf<M>>(index: I): GetModule<M,I>
    get<P extends NestedPathsOf<M>>(path: P): GetNodeAtNestedPath<M,P>

    remove<I extends IndexesOf<M>>(index: I): Node<RemoveModule<M, I>>
    remove<P extends PathsOf<M>>(path: P): Node<RemoveNodeAtPath<M, P>>

    swap<A extends IndexesOf<M>, B extends IndexesOf<M>>(from: A, to: B): Node<SwapModules<M, A, B>> 

}

type Node<M extends ModuleArray = ModuleArray> = ModulesInterface<M, NodeInterface<M>>

const Node = class <M extends ModuleArray> extends Modules<M> implements NodeInterface<M> {

    static is<N extends Node>(input: Module): input is N {
        return input instanceof this 
    }
    
    static create<Mx extends ModuleArray>(...modules: Mx): Node<Mx> {
        return Modules.applyInterface(
            new this(...modules)
        ) as Node<Mx>
    }

    override get<I extends IndexesOf<M>>(index: I): GetModule<M,I>
    override get<P extends NestedPathsOf<M>>(path: P): GetNodeAtNestedPath<M,P>
    override get(at: number | path): Module | Node {
        return isNumber(at)
            ? super.get(at as IndexesOf<M>)
            : getNodeAtPath(this.modules, at as NestedPathsOf<M>) as Module | Node
    }

    add<Mx extends readonly Module<any>[]>(...modules: Mx): Node<AddModules<M, Mx>> {
        return Node.create(
            ...Modules.add(
                this.modules, 
                modules
            )
        )
    }

    insert<I extends IndexesOf<M>, Mx extends ModuleArray>(index: I, ...modules: Mx): Node<InsertModule<M, I, Mx>> {
        return Node.create(
            ...Modules.insert(
                this.modules,
                index,
                ...modules
            )
        )
    }

    set<F extends (input: GetNodeAtPath<M, P>) => Node, P extends PathsOf<M>>(
        path: P, 
        initialzer: F
    ): Node<SetNodeAtPath<M, ToPath<P>, ReturnType<F>>>
    set<N extends Node, P extends path>(path: P, node: N): Node<SetNodeAtPath<M, P, N>>
    set<F extends (input: M[I]) => Module, I extends IndexesOf<M>>(
        index: I, 
        initializer: F
    ): Node<SetModule<M, I, ReturnType<F>>>
    set<Mx extends Module, I extends IndexesOf<M>>(index: I, module: Mx): Node<SetModule<M, I, Mx>>

    set(...args: unknown[]): unknown {

        const [ at, module ] = args 

        const modules = isNumber(at)
            ? Modules.set(
                this.modules,
                at as IndexesOf<M>,
                module as any
            )
            : setNodeAtPath(
                this.modules,
                at as path,
                module as Modules
            )

        return Node.create(
            ...modules
        )
    }

    remove<I extends IndexesOf<M>>(index: I): Node<RemoveModule<M, I>>
    remove<P extends PathsOf<M>>(path: P): Node<RemoveNodeAtPath<M, P>>
    remove(at: path | number): unknown {

        const modules = isNumber(at)
            ? Modules.remove(this.modules, at as IndexesOf<M>)
            : removeNodeAtPath(this.modules, at as PathsOf<M>)

        return Node.create(...modules)
    }

    swap<A extends IndexesOf<M>, B extends IndexesOf<M>>(fromIndex: A, toIndex: B): Node<SwapModules<M, A, B>> {
        return Node.create(
            ...Modules.swap(
                this.modules,
                fromIndex,
                toIndex
            )
        )
    }

} as {

    is<N extends Node>(input: Module): input is N
    create<Mx extends ModuleArray>(...modules: Mx): Node<Mx>

}

//// Exports ////

export default Node

export {
    Node
}

