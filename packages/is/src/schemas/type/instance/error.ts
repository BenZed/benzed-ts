import Instance, { InstanceExtendsSettings } from './instance'

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Types ////

interface ErrorSettings extends InstanceExtendsSettings<ErrorConstructor> {}

//// Exports ////

class Error extends Instance<ErrorConstructor> {

    constructor(settings?: ErrorSettings) {
        super({
            Type: global.Error,
            ...settings
        })
    }

}

//// Exports ////

export default Error

export {
    Error,
    ErrorSettings
}

export const $error = new Error()
