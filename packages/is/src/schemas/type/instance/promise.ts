import Instance, { InstanceExtendsSettings } from './instance'

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Types ////

interface PromiseSettings extends InstanceExtendsSettings<PromiseConstructor> {}

//// Exports ////

class Promise extends Instance<PromiseConstructor> {

    constructor(settings?: PromiseSettings) {
        super({
            Type: global.Promise,
            ...settings
        })
    }

}

//// Exports ////

export default Promise

export {
    Promise,
    PromiseSettings
}

export const $promise = new Promise()
