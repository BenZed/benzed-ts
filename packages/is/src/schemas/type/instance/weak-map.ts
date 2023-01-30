import Instance, { InstanceExtendsSettings } from './instance'

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Types ////

interface WeakMapSettings extends InstanceExtendsSettings<WeakMapConstructor> {}

//// Exports ////

class WeakMap extends Instance<WeakMapConstructor> {

    constructor(settings?: WeakMapSettings) {
        super({
            Type: global.WeakMap,
            ...settings
        })
    }

}

//// Exports ////

export default WeakMap

export {
    WeakMap,
    WeakMapSettings
}

export const $weakmap = new WeakMap()
