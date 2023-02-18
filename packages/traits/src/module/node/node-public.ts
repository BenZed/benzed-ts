import { 

    getChildren,
    Children
} from '..'
import { ModuleFind, ModulePublic } from '../module-public'

import { $$state } from '../state'

//// Main ////

export class NodeFind extends ModuleFind {

    get [$$state](): Children<this> {
        return getChildren(this)
    }

}

/**
 * A node with public getters for common node relations
 */
export class NodePublic extends ModulePublic {

    get [$$state](): Children<this> {
        return getChildren(this)
    }
    
}