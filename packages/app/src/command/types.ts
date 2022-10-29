
export interface Command {
    name: string
}

class CommandDefinition<N extends string, D extends object, R extends object> {

    constructor(
        readonly name: N
    ) { }

}

/*** Exports ***/

export default CommandDefinition