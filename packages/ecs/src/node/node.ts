
import { IndexesOf } from '@benzed/util'
import { 
    Module, 
    ModuleArray,

    Modules, 
    ModulesInterface,

    AddModules,
    SwapModules,
    RemoveModule,
    SetModule,

} from '../module'
import { InsertModule } from '../module/module-operations'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Definition ////

interface NodeInterface<M extends ModuleArray> extends Modules<M> {
    
    add<Mx extends ModuleArray>(...modules: Mx): Node<AddModules<M, Mx>>

    insert<Mx extends Module, I extends IndexesOf<M>>(index: I, module: Mx): Node<InsertModule<M, I, Mx>>

    set<F extends (input: M[I]) => Module, I extends IndexesOf<M>>(index: I, module: F): Node<SetModule<M, I, ReturnType<F>>>
    set<Mx extends Module, I extends IndexesOf<M>>( index: I, module: Mx): Node<SetModule<M, I, Mx>>

    remove<I extends IndexesOf<M>>(index: I): Node<RemoveModule<M, I>>

    swap<A extends IndexesOf<M>, B extends IndexesOf<M>>(from: A, to: B): Node<SwapModules<M, A, B>> 

}

type Node<M extends ModuleArray> = ModulesInterface<NodeInterface<M>, M>

const Node = class <M extends ModuleArray> extends Modules<M> implements NodeInterface<M> {

    static create<Mx extends ModuleArray>(...modules: Mx): Node<Mx> {
        return Modules.applyInterface(
            new this(...modules)
        ) as Node<Mx>
    }

    add<Mx extends readonly Module<any>[]>(...modules: Mx): Node<AddModules<M, Mx>> {
        return Node.create(
            ...Modules.add(
                this.modules,
                modules
            )
        )
    }

    insert<I extends IndexesOf<M>, Mx extends Module>(index: I, module: Mx): Node<InsertModule<M, I, Mx>> {
        return Node.create(
            ...Modules.insert(
                this.modules,
                index,
                module
            )
        )
    }
    
    set<I extends IndexesOf<M>, F extends (input: M[I]) => Module>(index: I, module: F): Node<SetModule<M, I, ReturnType<F>>>
    set<A extends IndexesOf<M>, Mx extends Module>(index: A, module: Mx): Node<SetModule<M, A, Mx>> {
        return Node.create(
            ...Modules.set(
                this.modules,
                index,
                module
            )
        )
    }

    remove<R extends IndexesOf<M>>(index: R): Node<RemoveModule<M, R>> {
        return Node.create(
            ...Modules.remove(
                this.modules,
                index,
            )
        )
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

    create<Mx extends ModuleArray>(...modules: Mx): Node<Mx>

}

//// Exports ////

export default Node

export {
    Node
}

