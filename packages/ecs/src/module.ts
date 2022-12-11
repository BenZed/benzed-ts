import { Func, nil, TypeGuard } from '@benzed/util'
import type { GenericNode } from './node'

//// Types ////

export type GetModule<M extends Module> = M | TypeGuard<M, Module>

export type FindScope = 'parent' | 'siblings' | 'children'
export type path = `/${string | number}`

export type Extension = object | Func

//// Definition ////

class Module {

    get root(): GenericNode {
        throw new Error('Not yet implemented.')
    }

    get parent(): GenericNode | nil{
        throw new Error('Not yet implemented.')
    }
    get first(): Module | nil {
        throw new Error('Not yet implemented.')
    }
    get last(): Module | nil{
        throw new Error('Not yet implemented.')
    }
    get modules(): Module[]{
        throw new Error('Not yet implemented.')
    }

    get prev(): Module | nil{
        throw new Error('Not yet implemented.')
    }
    get next(): Module | nil {
        throw new Error('Not yet implemented.')
    }

    get<M extends Module>(type: GetModule<M>, scope: FindScope, required: true): M | nil    
    get<M extends Module>(type: GetModule<M>, scope: FindScope, required?: false): M | nil
    get<M extends Module>(scope: FindScope, required: true): M | nil
    get<M extends Module>(scope: FindScope, required?: false): M | nil 

    get(...args: unknown[]): Module | nil {
        throw new Error('Not yet implemented.')
    }

    find<M extends Module>(type: GetModule<M>, scope: FindScope): M[]
    find<M extends Module>(type: GetModule<M>): M[] 
    
    find(...args: unknown[]): Module[] {
        throw new Error('Not yet implemented.')
    }

}

//// Exports ////

export default Module 

export {
    Module
}