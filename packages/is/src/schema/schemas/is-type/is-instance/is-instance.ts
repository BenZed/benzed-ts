import IsType from '../is-type'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

export type IsInstanceInput = 
    (new (...args: any) => object) | 
    (abstract new (...args: any) => object)

//// Main ////

class IsInstance<C extends IsInstanceInput> extends IsType<InstanceType<C>> {

    constructor(readonly Type: C) {

        const isInstanceOf = (i: unknown): i is InstanceType<C> => 
            i instanceof this.Type

        super({
            name: Type.name,
            is: isInstanceOf
        })

    }

}

//// Exports ////

export default IsInstance

export {
    IsInstance
}