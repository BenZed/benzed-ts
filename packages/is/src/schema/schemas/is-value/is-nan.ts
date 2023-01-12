import IsValue from './is-value'

//// Exports ////

class IsNaN extends IsValue<typeof NaN> {

    constructor() {
        super(NaN)
    }

}

//// Exports ////

export default IsNaN

export {
    IsNaN
}

export const isNaN = new IsNaN