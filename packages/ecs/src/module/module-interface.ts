
import { 
    FindModule, 
    AssertModule, 
    HasModule, 
    FindInput,
    FindOutput
} from '../find'

import type { Modules } from '../modules'
import Module, { ModuleArray } from './module'

//// Definition ////

/**
 * @internal
 * Currently unused, but may be handy at least as a ref later
 */
interface ModuleInterface<D> {

    data: D

    readonly name: string

    //// Relationships ////

    readonly parent: Modules 
    readonly hasParent: boolean

    eachSibling(): IterableIterator<Module>
    readonly siblings: ModuleArray
    readonly numSiblings: number

    eachParent(): IterableIterator<Modules> 
    get parents(): Modules[]
    get numParents(): number

    eachAncestor(): IterableIterator<Module | Modules>
    get ancestors(): (Module | Modules)[]
    get numAncestors(): number

    get root(): Module | Modules

    //// Find interface ////

    get find(): FindModule
    get has(): HasModule 
    assert<T extends FindInput>(input: T): FindOutput<T>
    assert(error?: string): AssertModule

}

//// Exports ////

export default ModuleInterface 

export {
    ModuleInterface
}