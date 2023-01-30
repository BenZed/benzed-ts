import Instance, { InstanceExtendsSettings } from './instance'

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Types ////

interface RegExpSettings extends InstanceExtendsSettings<RegExpConstructor> {}

//// Exports ////

class RegExp extends Instance<RegExpConstructor> {

    constructor(settings?: RegExpSettings) {
        super({
            Type: global.RegExp,
            ...settings
        })
    }

}

//// Exports ////

export default RegExp

export {
    RegExp,
    RegExpSettings
}

export const $regexp = new RegExp()
