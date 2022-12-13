
import { 
    AddModules,
    Module, 
    Modules, 
    ModulesInterface
} from '../module'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Definition ////

interface NodeInterface<M extends readonly Module[]> extends Modules<M> {
    add<Mx extends readonly Module[]>(...modules: Mx): Node<AddModules<M, Mx>>
}

type Node<M extends readonly Module[]> = ModulesInterface<NodeInterface<M>, M>

const Node = class <M extends readonly Module[]> extends Modules<M> {

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

} as {

    create<Mx extends readonly Module[]>(...modules: Mx): Node<Mx>

}

//// Exports ////

export default Node

export {
    Node
}

