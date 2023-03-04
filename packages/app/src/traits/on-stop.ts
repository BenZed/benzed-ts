import is from '@benzed/is'
import { Trait } from '@benzed/traits'

//// Main ////

/**
 * Trait modules can implement if they require functionality to execute on start
 */
abstract class OnStop extends Trait {

    static override readonly is: (input: unknown) => input is OnStop = is.shape({
        onStop: is.function,
    }).strict(false)

    abstract onStop(): void | Promise<void>

}

//// Exports ////

export default OnStop

export {
    OnStop
}