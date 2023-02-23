
import { Trait } from '../trait'
import Mutate from './mutate'

//// Main ////

type Mutator<T extends object> = Mutate<T> & { readonly [Mutate.target]: T }

type MutatorConstructor = abstract new <T extends object>(target: T) => Mutator<T>

/**
 * Convenience base class implementing the Mutator trait that
 * simply takes the target as an argument
 */
const Mutator = class extends Trait.use(Mutate) {

    readonly [Mutate.target]!: object

    constructor(target: object) {
        super()
        this[Mutate.target] = target
    }

} as MutatorConstructor

//// Exports ////

export { Mutator }