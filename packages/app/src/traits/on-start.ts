import is from '@benzed/is'
import { Trait } from '@benzed/traits'

//// Main ////

/**
 * Trait modules can implement if they require functionality to execute on start
 */
abstract class OnStart extends Trait {

    static override readonly is: (input: unknown) => input is OnStart = is.shape({
        onStart: is.function,
    }).strict(false)

    abstract onStart(): void | Promise<void>

}

//// Exports ////

export default OnStart

export {
    OnStart
}