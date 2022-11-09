/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type Modules = readonly _Module[]

type ModuleConstructor = new (parent: _Module | null, ...args: any[]) => _Module

type ModuleParams<T extends ModuleConstructor> = 
    ConstructorParameters<T> extends [_Module | null, ...infer R]
        ? R 
        : []

//// Main ////

class _Module {

    /**
     * @internal
     */
    static _create<T extends ModuleConstructor>(
        type: T,
        parent: _Module | null,
        params: ModuleParams<T>
    ): InstanceType<T> {
        return new type(parent, ...params) as InstanceType<T>
    }

    constructor(
        readonly parent: _Module | null
    ) {}

}

/*** Export ***/

export default _Module

export {
    _Module,
    Modules,
    ModuleConstructor,
    ModuleParams
}