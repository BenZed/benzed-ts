import { Command, CommandResult } from "./command"
import { Node } from '@benzed/ecs'

export type AppModules = readonly AppModule[]

export abstract class AppModule<M extends AppModules = AppModules> 
    extends Node<Command, CommandResult | Promise<CommandResult>, M> {

}