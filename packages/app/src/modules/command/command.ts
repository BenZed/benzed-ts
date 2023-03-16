import { Callable, Trait } from '@benzed/traits'
import { Node } from '@benzed/node'

import { HttpMethod } from '../../util'
import { Executable, Execute } from './executable'

import type {

    PutCommand,
    GetCommand,
    PostCommand,
    PatchCommand,
    DeleteCommand,
    OptionsCommand

} from './commands'

import Module from '../../module'

//// EsLint ////
/* eslint-disable
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

interface Command<I = any, O = any> extends Executable<I, O> {
    (input: I): O | Promise<O>

    get pathFromRoot(): string[]
    get path(): string
}

type CommandInput<C extends Command> = C extends Command<infer I, any> ? I : unknown
type CommandOutput<C extends Command> = C extends Command<any, infer O> ? O : unknown

type _CommandConstructor = abstract new <I, O>() => Command<I, O>

interface CommandConstructor extends _CommandConstructor {

    get<I = void, O = void>(execute: Execute<I, O>): GetCommand<I, O>
    post<I = void, O = void>(execute: Execute<I, O>): PostCommand<I, O>

    put<I = void, O = void>(execute: Execute<I, O>): PutCommand<I, O>
    patch<I = void, O = void>(execute: Execute<I, O>): PatchCommand<I, O>

    delete<I = void, O = void>(execute: Execute<I, O>): DeleteCommand<I, O>

    options<I = void, O = void>(execute: Execute<I, O>): OptionsCommand<I, O>

}

//// Implementation ////

const Command = class extends Trait.add(Executable, Callable) {

    static _create(execute: Execute, method: HttpMethod): Command {
        return new class extends Command<any, any> {

            get method(): HttpMethod {
                return method
            }

            onExecute(input: unknown) {
                return execute(input)
            }

        }
    }

    static get(execute: Execute) {
        return this._create(execute, HttpMethod.Get)
    }

    static post(execute: Execute) {
        return this._create(execute, HttpMethod.Post)
    }

    static put(execute: Execute) {
        return this._create(execute, HttpMethod.Put)
    }

    static patch(execute: Execute) {
        return this._create(execute, HttpMethod.Patch)
    }

    static delete(execute: Execute) {
        return this._create(execute, HttpMethod.Delete)
    }

    static options(execute: Execute) {
        return this._create(execute, HttpMethod.Options)
    }

    constructor() {
        super()
        return Callable.apply(this)
    }

    get method(): HttpMethod {
        throw new Error(`${this.constructor.name} has not implemented an 'method' getter.`)
    }

    override execute(input: unknown): unknown {
        return this.client
            ? this.client.sendCommand(this as Command, input)
            : this.onExecute(input)
    }

    onExecute(input: unknown): unknown {
        void input
        throw new Error(`${this.constructor.name} has not implemented an 'execute' method.`)
    }

    get pathFromRoot(): string[] {
        return Node
            .getPath(this)
            .map(String)
    }

    get path(): string {
        return this.pathFromRoot.at(-1) ?? this.name
    }

    /// Trait Implementations

    get [Callable.signature]() {
        return this.execute
    }

    [Module.copy](): this {
        const clone = super[Module.copy]()
        return Callable.apply(clone)
    }

    // [Module.copy](): this {
    //     const clone = Structural.prototype[Structural.copy].call(this) as this
    //     return Node.apply(Callable.apply(clone))
    // }

} as CommandConstructor

//// Exports ////

export {
    Command,
    CommandInput,
    CommandOutput,
    CommandConstructor
}
