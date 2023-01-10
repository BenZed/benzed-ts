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
        super({
            type: Type.name,
            is: (i): i is InstanceType<C> => 
                i instanceof Type
        })
    }

}

//// Exports ////

export default IsInstance

export {
    IsInstance
}