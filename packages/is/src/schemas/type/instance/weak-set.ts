import Instance, { InstanceExtendsSettings } from './instance'

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Types ////

interface WeakSetSettings extends InstanceExtendsSettings<WeakSetConstructor> {}

//// Exports ////

class WeakSet extends Instance<WeakSetConstructor> {

    constructor(settings?: WeakSetSettings) {
        super({
            Type: global.WeakSet,
            ...settings
        })
    }

}

//// Exports ////

export default WeakSet

export {
    WeakSet,
    WeakSetSettings
}

export const $weakset = new WeakSet()
