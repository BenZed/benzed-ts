
import { IndexesOf } from '@benzed/util'
import { 
    AddModules,
    Module, 
    Modules, 
    ModulesInterface,
    SwapModules
} from '../module'
import { RemoveModule } from '../module/module-operations'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Definition ////

interface NodeInterface<M extends readonly Module[]> extends Modules<M> {
    
    add<Mx extends readonly Module[]>(...modules: Mx): Node<AddModules<M, Mx>>

    swap<A extends IndexesOf<M>, B extends IndexesOf<M>>(a: A, b: B): Node<SwapModules<M, A, B>> 

    remove<I extends IndexesOf<M>>(i: I): Node<RemoveModule<M,I>>

}

type Node<M extends readonly Module[]> = ModulesInterface<NodeInterface<M>, M>

const Node = class <M extends readonly Module[]> extends Modules<M> implements NodeInterface<M> {

    static create<Mx extends readonly Module[]>(...modules: Mx): Node<Mx> {
        return Modules.applyInterface(
            new this(...modules)
        ) as Node<Mx>
    }

    add<Mx extends readonly Module[]>(...modules: Mx): Node<AddModules<M, Mx>> {
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

    remove<A extends IndexesOf<M>>(index: A): Node<RemoveModule<M,A>> {
        return Node.create(
            ...Modules.remove(
                this.modules,
                index,
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

