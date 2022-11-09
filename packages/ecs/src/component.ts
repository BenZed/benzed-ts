/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

/*** Types ***/

type Components = readonly Component[]

type ComponentConstructor = new (parent: Component, ...args: any[]) => Component

/*** Module ***/

class Component {

    constructor(
        readonly parent: Component | null
    ) {}

}

/*** Export ***/

export default Component

export {
    Component,
    Components,
    ComponentConstructor
}