import { Func, isFunc, keysOf, property } from '@benzed/util'
import Module from './module'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Helper ////

/**
 * Get the method properties of a type.
 */
type _MethodsOf<M extends Module> = {
    [K in keyof M as M[K] extends Func ? K : never]: M[K]
}

/**
 * Add the key/values of type B if they do not exist on A
 */
type _Fill<A, B> = {
    [K in keyof A | keyof B]: K extends keyof A 
        ? A[K] 
        : K extends keyof B 
            ? B[K] 
            : never
}

//// Definition ////

interface EmptyNode<M extends readonly Module[]> {

    readonly modules: M

    /**
     * Create a node with a given set of modules.
     */
    create<Mx extends readonly Module[]>(...modules: Mx): Node<Mx>
}

/**
 * A node's interface is comprised of public methods of it's modules.
 */
type NodeInterface<M> = M extends [infer Mx, ...infer Mr] 
    ? Mx extends Module 
        ? _Fill<_MethodsOf<Mx>, NodeInterface<Mr>>
        : NodeInterface<Mr>
    : {}

type Node<M extends readonly Module[]> = EmptyNode<M> & NodeInterface<M>

export type GenericNode = Node<Module[]>

//// Implementation ////

function deferModuleInterfaceMethod(module: Module, methodName: string): Func {

    const m = module as unknown as { [name: string]: Func }

    return property.name((...args: unknown[]) => {
        return m[methodName](...args)
    }, methodName)

}

/**
 * @internal
 * Implementation of the Node interface
 */
class NodeImplementation {

    constructor(
        readonly modules: readonly Module[]
    ) {
        this._applyNodeInterface()
    }

    create(...modules: readonly Module[]): NodeImplementation {
        return new NodeImplementation(modules)
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
                        value: deferModuleInterfaceMethod(module, key)
                    }
                }
            }
        }

        define(this, nodeDescriptors)
    }

}

//// Exports ////

const Node = new NodeImplementation([]) as unknown as Node<[]> 

export default Node
export {
    Node
}

