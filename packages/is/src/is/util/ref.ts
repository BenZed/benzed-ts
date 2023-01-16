import { TypeOf } from '@benzed/util'
import { AnySchematic, Schematic } from '../../schema'

//// RefSchematic ////

/**
 * Schematic that exposes/transforms properties of it's reference schematic 
 * for it's own purposes
 */
abstract class RefSchematic<T extends AnySchematic> extends Schematic<TypeOf<T>> {

    constructor(readonly ref: T) {
        super(function refValidate(this: RefSchematic<T>, i): TypeOf<T> {
            return this.ref.validate(i)
        })
        this._refInherit()
    }

    protected abstract _refInherit(): void

}

//// Exports ////

export default RefSchematic

export {
    RefSchematic
}