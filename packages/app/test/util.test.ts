import { Command } from '../src/command'
import { CommandModule } from '../src/module'

import { match } from '@benzed/match'

/*** Calculator Module ***/

interface MathCommand extends Command {
    readonly values: [number, number]
}

interface AddCommand extends MathCommand {
    readonly name: `add`
}

interface SubtractCommand extends MathCommand {
    readonly name: 'subtract'
}

interface MultiplyCommand extends MathCommand {
    readonly name: 'multiply'
}

interface DivideCommand extends MathCommand {
    readonly name: 'divide'
}

export type MathCommands = AddCommand | SubtractCommand | MultiplyCommand | DivideCommand

export class Calculator extends CommandModule<MathCommands> {

    _execute({ name, values: [a,b] }: MathCommands): { result: number } {

        const [ result ] = match(name)
        (`add`, a + b)
        (`subtract`, a - b)
        (`multiply`, a * b)
        (`divide`, a / b)
 
        return { result }
    }

    canExecute(command: Command): command is MathCommands {
        return match(command.name)
        (`add`, true)
        (`subtract`, true)
        (`multiply`, true)
        (`divide`, true)
        (false).next()
    }

}