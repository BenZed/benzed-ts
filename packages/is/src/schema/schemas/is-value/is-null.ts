
import IsValue from './is-value'

//// Main ////

class IsNull extends IsValue<null> {

    constructor() {
        super(null)
    }

}

//// Exports ////

export default IsNull

export {
    IsNull
}

export const isNull = new IsNull