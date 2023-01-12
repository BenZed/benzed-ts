
import IsValue from './is-value'

//// Main ////

class IsUndefined extends IsValue<undefined> {

    constructor() {
        super(undefined)
    }

}

//// Exports ////

export default IsUndefined

export {
    IsUndefined
}

export const isUndefined = new IsUndefined