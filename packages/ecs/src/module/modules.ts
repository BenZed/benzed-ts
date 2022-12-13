import { Func, IndexesOf, isFunc, keysOf, property } from '@benzed/util'
import { Fill, MethodsOf } from '../types'

import Module from './module'

/* eslint-disable 
    @typescript-eslint/ban-types,
    @typescript-eslint/no-explicit-any
*/

//// Types ////

/**
 * A node's interface is comprised of public methods of it's modules.
 */
type ModulesInterface<M> = M extends [infer Mx, ...infer Mr] 
    ? Mx extends Module 
        ? Fill<MethodsOf<Mx>, ModulesInterface<Mr>>
        : ModulesInterface<Mr>
    : {}

//// Definition ////

// type Node<M extends readonly Module[]> = Fill<NodeInterface<M>, NodeModuleInterface<M>>

type ModulesOf<T> = T extends Modules<infer M> ? M : []

type _ME<E extends (new (...modules: readonly Module[]) => Modules<readonly Module[]>)> = E & {

    new <M extends readonly Module[]>(...modules: M): 
    InstanceType<E> & 
    ModulesInterface<ModulesOf<InstanceType<E>>> 

}

export type ModulesExtension<I extends Modules<M>, M extends readonly Module[]> = 
    Fill<I, ModulesInterface<M>>

//// Main ////

class Modules<M extends readonly Module[]> extends Module<M> implements Iterable<M[number]> {

    /**
     * @param ModuleExtension 
     * @returns 
     */
    static applyInterface<E extends (new (...args: any[]) => Modules<readonly Module[]>)>(
        ModuleExtension: E
    ): _ME<E> {
        return class extends ModuleExtension {
        
            private constructor(...args: any[]) {
                super(...args)
                Modules._applyInterface(this)
            }
        
        } as _ME<E>

    }

    private static _applyInterface(modules: Modules<readonly Module[]>): void {

        const { descriptorsOf, prototypeOf, define } = property
  
        const nodeInterfaceDescriptors: PropertyDescriptorMap = {}

        for (const module of modules.modules) {
            const moduleDescriptors = descriptorsOf(prototypeOf(module))
            for (const key of keysOf(moduleDescriptors)) {

                const isPrivate = key.startsWith('_')
                const isConstructor = key === 'constructor'
                const isAlreadyDefined = key in nodeInterfaceDescriptors
                const isFunction = 'value' in moduleDescriptors[key] && isFunc(moduleDescriptors[key].value)

                if (
                    !isPrivate && 
                    !isConstructor && 
                    !isAlreadyDefined && 
                    isFunction
                ) {
                    nodeInterfaceDescriptors[key] = {
                        ...moduleDescriptors[key],
                        value: wrapNodeInterfaceMethod(module, key)
                    }
                }
            }
        }

        define(modules, nodeInterfaceDescriptors)
    }

    //// State ////
    
    /**
     * Get children of this module.
     */
    override get modules(): M {
        return this.state
    }

    override _setState(state: M): this {
        const Constructor = this.constructor as new (...modules: M) => this
        return new Constructor(...state)
    }

    constructor(...modules: M) {

        super(modules)

        for (const module of this) 
            module._applyParent(this)
    }

    //// Interface ////

    get<I extends IndexesOf<M>>(index: I): M[I] {
        const module = this.modules.at(index)
        if (!module)
            throw new Error('Invalid index.')

        return module
    }

    //// Iterable Implementation ////
    
    *[Symbol.iterator](): Iterator<M[number]> {
        yield* this.state
    }

}

//// Helper ////

function wrapNodeInterfaceMethod(module: Module, methodName: string): Func {

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

export default Modules

export {
    Modules,
    ModulesInterface
}