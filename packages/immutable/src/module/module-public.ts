import { each } from '@benzed/util'
import { 
    AssertModule,
    Find, 
    FindFlag, 
    FindModule, 
    getParent, 
    HasModule, 
    Parent,

    eachAncestor,
    eachSibling,
    eachDescendent,
    getChildren,
    Module
} from '.'

//// Main ////

export class ModuleFind extends Module {

    get find(): FindModule {
        return new Find(this)
    }

    get has(): HasModule {
        return new Find(this, FindFlag.Has)
    }
    
    get assert(): AssertModule {
        return new Find(this, FindFlag.Assert)
    }

}

/**
 * A node with public getters for common node relations
 */
export class ModulePublic extends ModuleFind {

    // Relations

    get ancestors(): Module[] {
        return Array.from(eachAncestor(this))
    }
    
    get parent(): Parent<this> {
        return getParent(this)
    }

    get siblings(): Module[] { 
        return Array.from(eachSibling(this))
    }

    get children(): Module[] {
        const children = getChildren(this)
        return Array.from({
            ...children,
            length: each(children).count
        })
    }

    get descendents(): Module[] {
        return Array.from(eachDescendent(this))
    }

}