import is from '@benzed/is'
import { Trait } from '@benzed/traits'

//// Main ////

/**
 * Modules consume the path trait to modify their effect on the
 * url endpoint of any nested commands
 */
abstract class Path extends Trait {

    static override readonly is: (input: unknown) => input is Path = is.shape({

    }).strict(false)

}

//// Exports ////

export default Path

export {
    Path
}