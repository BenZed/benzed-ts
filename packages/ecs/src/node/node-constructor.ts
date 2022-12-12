import { 
    Func, 
    isFunc, 
    keysOf, 
    property 
} from '@benzed/util'

import { Module } from '../module'
import Modules from '../module/modules'
import { Node } from './node-type'

//// NodeConstructor ////

export interface NodeConstructor {

    create<M extends readonly Module[]>(modules: M): Node<M>

    new <M extends readonly Module[]>(modules: M): Node<M>

}

//// NodeConstructor class implementation ////

/**
 * @internal
 * Implementation of the Node interface
 */
const Node = class <M extends readonly Module[]> extends Modules<M> {

    static create<Mx extends readonly Module[]>(...modules: Mx): Node<Mx> {
        return new Node(modules)
    }

    //// Main ////

    constructor(
        modules: M
    ) {
        super(modules)
        this._applyNodeInterface()
    }

    //// Helper ////
    
    private _applyNodeInterface(): void {

        const { descriptorsOf, prototypeOf, define } = property
  
        const nodeDescriptors: PropertyDescriptorMap = {}

        for (const module of this.modules) {
            const moduleDescriptors = descriptorsOf(prototypeOf(module))
            for (const key of keysOf(moduleDescriptors)) {

                const isPrivate = key.startsWith('_')
                const isConstructor = key === 'constructor'
                const isAlreadyDefined = key in nodeDescriptors
                const isFunction = 'value' in moduleDescriptors[key] && isFunc(moduleDescriptors[key].value)

                if (
                    !isPrivate && 
                    !isConstructor && 
                    !isAlreadyDefined && 
                    isFunction
                ) {
                    nodeDescriptors[key] = {
                        ...moduleDescriptors[key],
                        value: wrapAppliedNodeInterfaceMethod(module, key)
                    }
                }
            }
        }
        define(this, nodeDescriptors)
    }

} as NodeConstructor

//// Helper ////

function wrapAppliedNodeInterfaceMethod(module: Module, methodName: string): Func {

    const methodDeferred = (...args: unknown[]): unknown => 
        (module as unknown as { [key: string]: Func })
            [methodName]
            (...args)

    return property.name(
        methodDeferred, 
        methodName
    )
}

//// Exports ////

export default Node
export {
    Node
}

