import { Callable, TypeOf } from '@benzed/util'
import { AnySchematic, Schematic } from './schema'

//// Main ////

/**
 * This is the class that allows schematics to chain one another together
 * through the usage of mutators
 */
class To<T extends AnySchematic> extends Callable<Schematic<TypeOf<T>>> {

}

//// Main ////

const is = new To()

//// Exports ////

export default is

export {
    is,
    To
}