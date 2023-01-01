import { callable, Func, Indexes, indexesOf, IndexesOf, isFunc, isNumber, keysOf, property } from '@benzed/util'

import { Node, Nodes } from '../node'

import { 
    FindInput, 
    FindOutput, 
} from './module-finder'

import { Module, Modules } from './module'
import { setModule, SetModule } from './operations'

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Helper Types ////

type _Returns<F> = F extends Func ? ReturnType<F> : never
type _Params<F> = F extends Func ? Parameters<F> : never 

type _ModuleMethods<M extends Modules, I extends IndexesOf<M>> = {
    [K in keyof M[I] as M[I][K] extends Func ? K : never]: _Returns<M[I][K]> extends Module  
        ? (...args: _Params<M[I][K]>) => SetModule<M, I, _Returns<M[I][K]>>
        : M[I][K]
}

type _Fill<A,B> = {
    [K in keyof A | keyof B]: K extends keyof A ? A[K] : K extends keyof B ? B[K] : never
}

type _ModulesMethods<M extends Modules, I = Indexes<M>> = I extends [infer I1, ...infer Ir]
    ? I1 extends IndexesOf<M>
        ? _Fill<_ModuleMethods<M, I1>, _ModulesMethods<M, Ir>>
        : _ModulesMethods<M, Ir>
    : {}

//// Types ////

type ModuleInterface<M extends Modules> =   
(<I extends FindInput>(find: I) => FindOutput<I>) & 
(<I extends IndexesOf<M>>(index: I) => M[I]) & 
_ModulesMethods<M>

interface ModuleInterfaceConstructor {
    new <M extends Modules>(node: Node<M, Nodes>): ModuleInterface<M>
}

//// Implementation ////

const ModuleInterface = callable(
    function (input: FindInput | number): FindOutput<FindInput> {
        return isNumber(input) 
            ? this.node.modules[input] 
            : this.node.assertModule(input)
    },
    class {

        constructor(readonly node: Node) {
            this._applyModuleInterface(node.modules)
        }

        private _wrapModuleMethod(method: Func, modules: Modules, index: number): Func {

            const module = modules[index]

            const wrapped = (...args: unknown[]): unknown => {
                const output = method.apply(module, args)
                return Module.isModule(output)
                    ? setModule(modules, index, output)
                    : output
            }

            return property.name(wrapped, method.name)
        }

        private _applyModuleInterface(modules: Modules): void {

            const { descriptorsOf, prototypesOf, define } = property

            const BLACKLIST = [Object.prototype, Module.prototype]

            const modulesDescriptors = descriptorsOf(
                ...prototypesOf(modules, BLACKLIST)
            )
            
            const applyDescriptors: PropertyDescriptorMap = {}
            
            for (const index of indexesOf(modules)) {  

                const module = modules[index]

                const descriptors = descriptorsOf(...prototypesOf(module, BLACKLIST))
                for (const key of keysOf(descriptors)) { 
                    
                    const { value, ...descriptor } = descriptors[key]

                    const isPrivate = key.startsWith('_')
                    const isAlreadyDefined = key in applyDescriptors || key in modulesDescriptors
                    const isMethod = isFunc(value)
                    
                    if (!isPrivate && !isAlreadyDefined && isMethod) {

                        applyDescriptors[key] = {
                            ...descriptor,
                            enumerable: true,
                            value: this._wrapModuleMethod(value, modules, index)
                        }
                    }
                }
            }
            define(this, applyDescriptors)
        }
    }
) as ModuleInterfaceConstructor

//// Exports ////

export default ModuleInterface 

export {
    ModuleInterface
}