
import { 
    Module, 
    Modules, 
    ModulesExtension
} from '../module'

import { Fill, MethodsOf } from '../types'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Definition ////

interface NodeInterface<M extends readonly Module[]> extends Modules<M> {

}

export type Node<M extends readonly Module[]> = ModulesExtension<NodeInterface<M>, M>

/**
 * @internal
 * Implementation of the Node interface
 */
const Node = Modules.applyInterface(class <M extends readonly Module[]> extends Modules<M> {

    static create<Mx extends readonly Module[]>(...modules: Mx): Node<Mx> {
        return new Node(...modules) as Node<Mx>
    }

})

//// Exports ////

export default Node

export {
    Node
}

