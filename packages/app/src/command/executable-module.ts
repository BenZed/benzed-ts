
import { Transform, callable } from '@benzed/util'
import { Module } from '../module'
// import callable from './callable'

//// Types ////

interface ExecutableModule<I extends object, O extends object> extends Module, Transform<I,O> {
    readonly execute: Transform<I,O>
}

//

interface ExecutableModuleConstructor {
    new<I extends object, O extends object>(
        
        execute: Transform<I, O> | 
        ((this: ExecutableModule<I,O>, input: I) => O)

    ): ExecutableModule<I, O>
}

//// Executable Module ////

const ExecutableModule: ExecutableModuleConstructor = callable(
    function (i: object): object {
        return this.execute(i)
    },
    class extends Module {

        constructor(
            readonly execute: Transform<object, object>,
        ) {
            super()
        }

        protected override get _copyParams(): unknown[] {
            return [this.execute]
        }
    }
)

//// Exports ////

export default ExecutableModule

export {
    ExecutableModule
}