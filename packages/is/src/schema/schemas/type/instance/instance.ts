import Type from '../type'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

export type InstanceInput = 
    (new (...args: any) => object) | 
    (abstract new (...args: any) => object)

//// Main ////

class Instance<C extends InstanceInput> extends Type<InstanceType<C>> {

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

export default Instance

export {
    Instance
}