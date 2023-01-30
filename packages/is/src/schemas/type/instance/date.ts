import Instance, { InstanceExtendsSettings } from './instance'

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Types ////

interface DateSettings extends InstanceExtendsSettings<DateConstructor> {}

//// Exports ////

class Date extends Instance<DateConstructor> {

    constructor(settings?: DateSettings) {
        super({
            Type: global.Date,
            ...settings
        })
    }

}

//// Exports ////

export default Date

export {
    Date,
    DateSettings
}

export const $date = new Date()
