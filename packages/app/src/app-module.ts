import { Command, CommandResult } from "./command"
import { Node } from '@benzed/ecs'

export type AppModules = readonly AppModule[]

export abstract class AppModule extends Node<Command, CommandResult | Promise<CommandResult>, AppModules> {

}