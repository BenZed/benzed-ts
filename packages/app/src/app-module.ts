import { Command, CommandResult } from "./command"
import { Node } from '@benzed/ecs'

export type AppModules = readonly AppModule[]

export abstract class AppModule<M extends AppModules = AppModules> 
    extends Node<Command, CommandResult | Promise<CommandResult>, M> {
    
    compute(cmd: Command): CommandResult | Promise<CommandResult> {

        // TODO this is where command matching would go
        for (const component of this.components)
            console.log(`${this.constructor.name} ${cmd} ${component.constructor.name}`)

        return cmd
    }
}