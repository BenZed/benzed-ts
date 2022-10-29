import App from "../app"
import CommandDefinition, { Command } from "./types"

/**
 * Contains data about the current command, as well as implementations
 * for working with them in either the context of rest or realtime connections.
 */
class CommandContext<C extends Command> {

    // constructor(
    //     readonly definition: CommandDefinition<C>
    // ) { }
    
}

/*** Exports ***/

export default CommandContext 

export {
    CommandContext
}