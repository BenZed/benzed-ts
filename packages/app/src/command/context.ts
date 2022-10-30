import App from "../app"
import Command from "./command"

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/**
 * Contains data about the current command, as well as implementations
 * for working with them in either the context of rest or realtime connections.
 */
class CommandContext<C extends Command> {

    // constructor(
    //     readonly definition: CommandDefinition<C>
    // ) { }

    result: C['result'] | null = null
    
}

/*** Exports ***/

export default CommandContext 

export {
    CommandContext
}