/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type Components = readonly Component[]

type ComponentConstructor = new (parent: Component | null, ...args: any[]) => Component

type ComponentParams<T extends ComponentConstructor> = 
    ConstructorParameters<T> extends [Component | null, ...infer R]
        ? R 
        : []

//// Main ////

class Component {

    /**
     * @internal
     */
    static create<T extends ComponentConstructor>(
        type: T,
        parent: Component | null,
        params: ComponentParams<T>
    ): InstanceType<T> {
        return new type(parent, ...params) as InstanceType<T>
    }

    constructor(
        readonly parent: Component | null
    ) {}

}

/*** Export ***/

export default Component

export {
    Component,
    Components,
    ComponentConstructor,
    ComponentParams
}