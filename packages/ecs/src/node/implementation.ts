import { 
    Func, 
    isFunc, 
    keysOf, 
    property 
} from '@benzed/util'

import Module from '../module'
import { Node } from './definition'

//// Helper ////

function deferModuleMethod(module: Module, methodName: string): Func {

    const methodDeferred = (...args: unknown[]): unknown => 
        (module as unknown as { [key: string]: Func })
            [methodName]
            (...args)

    return property.name(
        methodDeferred, 
        methodName
    )
}

//// Main ////

/**
 * @internal
 * Implementation of the Node interface
 */
class _Node extends Module {

    override get modules(): readonly Module[] {
        return this._modules
    }

    constructor(
        private readonly _modules: readonly Module[]
    ) {
        super()
        this._applyNodeInterface()
    }

    //// Main ////

    create(...modules: readonly Module[]): _Node {
        return new _Node(modules)
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
                        value: deferModuleMethod(module, key)
                    }
                }
            }
        }
        define(this, nodeDescriptors)
    }

}

//// Exports ////

const Node = new _Node([]) as unknown as Node<[]> 

export default Node
export {
    Node
}

