import { Func, nil } from '@benzed/util'

import { 
    Extension, 
    FindScope, 
    GetModule, 
    Module, 
    Modules 
} from './module'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

type SetModule<M extends Module> = M 

type Add<Mx extends Module, M extends Modules> = [...M, Mx]

export type AnyNode = Node<{}, Modules>

//// Types ////

interface Node<N extends Func | object, M extends Modules> {

    get root(): AnyNode 

    get parent(): AnyNode | nil
    get first(): Module | nil 
    get last(): Module | nil
    get modules(): Module[]

    find<M extends Module>(type: GetModule<M>, scope: FindScope): M[]
    find<M extends Module>(type: GetModule<M>): M[]

    /**
     * Get a node by a path/to/a/location
     */
    get(): {}

    /**
     * Set a Node by a path: /path/to/location, which will automatically
     * create nodes between '/' delimeters
     * 
     * Set a Module by an index, replacing the module at that location.
     * 
     * Value is a new Node or Module. 
     * 
     * If the location is occupied, the value can be a function taking the
     * existing Node or Module as an argument, replaced value will be the output
     * of the method.
     */
    set(): {}

    /**
     * Add a Node by a path: /add, nodes cannot be created
     * between '/' delimiters. Method will throw if path is occupied.
     * 
     * Add a Module at the next index.
     * If the location is occupied, the value can be a function taking the
     * existing Node or Module as an argument, replaced value will be the output
     * of the method.
     */
    add(): {}

    /**
     * Remove a node by a path, /can/be/deeply/nested
     * Remove a module by an index.
     */
    remove(): {}

}

export interface NodeConstructor {

    create<M extends Modules>(modules: M): Node<{}, M>
    extend<E extends Extension>(): Node<E, []>

}

//// Exports ////

export default Node 

export {
    Node
}

