
import { IndexesOf } from '@benzed/util'
import { 
    AddModules,
    Module, 
    Modules, 
    ModulesInterface,
    SwapModules,
    RemoveModule,
    SetModule
} from '../module'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Definition ////

interface NodeInterface<M extends readonly Module[]> extends Modules<M> {
    
    add<Mx extends Module>(module: Mx): Node<[...M, Mx]>

    swap<A extends IndexesOf<M>, B extends IndexesOf<M>>(from: A, to: B): Node<SwapModules<M, A, B>> 

    remove<I extends IndexesOf<M>>(index: I): Node<RemoveModule<M, I>>

    set<F extends (input: M[I]) => Module, I extends IndexesOf<M>>(module: F, index: I): Node<SetModule<M, ReturnType<F>, I>>
    set<Mx extends Module, I extends IndexesOf<M>>(module: Mx, index: I): Node<SetModule<M, Mx, I>>

}

type Node<M extends readonly Module[]> = ModulesInterface<NodeInterface<M>, M>

const Node = class <M extends readonly Module[]> extends Modules<M> implements NodeInterface<M> {

    static create<Mx extends readonly Module[]>(...modules: Mx): Node<Mx> {
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

    swap<A extends IndexesOf<M>, B extends IndexesOf<M>>(fromIndex: A, toIndex: B): Node<SwapModules<M, A, B>> {
        return Node.create(
            ...Modules.swap(
                this.modules,
                fromIndex,
                toIndex
            )
        )
    }

    remove<R extends IndexesOf<M>>(index: R): Node<RemoveModule<M,R>> {
        return Node.create(
            ...Modules.remove(
                this.modules,
                index,
            )
        )
    }

    set<Mx extends Module, A extends IndexesOf<M>>(module: Mx, index: A): Node<SetModule<M, Mx, A>> {
        return Node.create(
            ...Modules.set(
                this.modules,
                module,
                index
            )
        )
    }

} as {

    create<Mx extends readonly Module[]>(...modules: Mx): Node<Mx>

}

//// Exports ////

export default Node

export {
    Node
}

