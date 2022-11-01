import is from '@benzed/is'
import { pluck } from "@benzed/array"
import { Pipe, StringKeys } from "@benzed/util"

import { HttpMethod } from "../modules/connection/server/http-methods"

import {
    Request,
    ToRequest, 
    FromRequest, 
    StringFields,
    
    createToReq,
    createFromReq
} from './request'

import { CamelCombine, Path } from '../types'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Types ////

type Validator<I extends object> = (data: unknown) => I

interface Command<I extends object = object, O extends Promise<object> = Promise<object>, P extends StringFields<I> | void = any> extends Pipe<I,O> {
    
    /**
     * Set data validation for this command
     */
    validator(validator: Validator<I> | { validate: Validator<I> }): Command<I, O, P>

    /**
     * Create generic request converters for this command
     */
    req(
        method: HttpMethod,
        url: Path
    ): Command<I, O, void> 
        
    /**
     * Set explicit request converters
     * for this command
     */
    req<Px extends StringFields<I>>(
        toReq: ToRequest<I, Px>,
        fromReq: FromRequest<I, Px>
    ): Command<I, O, Px> 

    req<Px extends StringFields<I>>(
        method: HttpMethod,
        url: Path,
        param: Px
    ): Command<I, O, Px> 

    validate?: Validator<I>

    toReq?: ToRequest<I, P extends void ? never : P>

    fromReq?: FromRequest<I, P extends void ? never : P>

}

/**
 * Get the input type of a command
 */
type CommandInput<C extends Command<any, any, any>> = C extends Command<infer I, any, any> ? I : never

/**
 * Get the output type of a command
 */
type CommandOutput<C extends Command<any, any, any>> = C extends Command<any, infer O, any> ? O : never

/**
 * Get a subobject of a type that is only comprised of commands
 */
type CommandsOf<T extends object, P extends string = ''> = {
    [K in StringKeys<T> as T[K] extends Command<any, any, any> ? CamelCombine<P, K> : never]: T[K]
}

/*** Main ***/

/**
 * Is the provided value a command?
 */
function isCommand(input: unknown): input is Command<any, any, any> {

    const cmd = input as any

    return is.function(cmd) && 
        is.function(cmd.validator) && 
        is.function(cmd.req)
}

/**
 * Extract the commands of an object to a new object
 */
function commandsOf<T extends object>(input: T): CommandsOf<T> {

    const commands: { [name: string]: Command } = {}

    for (const key in input) {
        const command = input[key]
        if (isCommand(command))
            commands[key] = command
    }

    return commands as CommandsOf<T>
}

/**
 * Create a command out of a pipe method 
 */
function command<I extends object, O extends Promise<object>>(execute: Pipe<I,O>): Command<I, O, void> {
    
    const _command = Object.assign(

        // Execute with validation
        (input: I) => execute(
            _command.validate?.(input) ?? input
        ),

        // Command Methods
        {

            req(this: Command<I, O, any>, ...args: any[]): any {

                const funcs = pluck(args, is.function)
        
                let toReq: ToRequest<I, never>
                let fromReq: FromRequest<I, never>
                
                if (funcs.length === 2) {
                    toReq = funcs[0] as any
                    fromReq = funcs[1] as any
                } else {
                    const [method, url, param] = args
                    toReq = createToReq<I,never>(method, url, param)
                    fromReq = createFromReq<I, never>(method, url, param)
                }

                this.toReq = toReq
                this.fromReq = fromReq

                return this
            },

            validator(this: Command<I, O, any>, validator: Validator<I> | { validate: Validator<I> }) {
                this.validate = `validate` in validator ? validator.validate : validator
                return this
            },

            validate: undefined as Validator<I> | undefined
        }
    )

    return _command
}

/*** Extend ***/

command.is = isCommand
command.of = commandsOf

/*** Exports ***/

export default command 

export {
    command,
    commandsOf,
    isCommand,

    Command,
    CommandsOf,
    CommandInput,
    CommandOutput,
    Validator as CommandValidator,

    Request as CommandRequestData,
    ToRequest as CommandInputToRequestData,
    FromRequest as RequestDataToCommandInput,
}