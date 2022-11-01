import { pipe, Pipe, PipeBuilder } from '@benzed/util'
import { isFunction, isString } from '@benzed/is'
import { pluck } from '@benzed/array'

import CommandModule from './command-module'

import { Path } from '../types'
import { HttpMethod } from '../modules'

/* eslint-disable 
    @typescript-eslint/explicit-function-return-type
*/

//// Types ////

/**
 * Command without build interface
 */
export type RuntimeCommand<N extends string, I extends object> = 
    Omit<Command<N,I,object>, 'pipe'>

export type Execute<I extends object, O extends object, N extends string> =
     ((this: RuntimeCommand<N, I>, input: I) => O) | Pipe<I, O>

//// Command ////

class Command<N extends string, I extends object, O extends object> extends CommandModule<N,I,O> {

    //// Static Interface ////

    /**
     * Create a new generic command
     * @param name - Name of the command, must be dash-cased.
     * @param execute - Handle command input to output
     * @param method - Http method this command maps to
     * @param path - url endpoint this command maps to
     * @returns new Command
     */
    static create<Nx extends string, Ix extends object, Ox extends object>(
        name: Nx,
        execute: Execute<Ix, Ox, Nx>,
        method?: HttpMethod,
        path?: Path
    ): Command<Nx,Ix,Ox>

    /**
     * Convience method for defining a POST command named 'create'
     * @param execute - Handle command input to output
     * @returns - new POST Command
     */
    static create<Ix extends object, Ox extends object>(
        execute: Execute<Ix, Ox, 'create'>
    ): Command<'create', Ix, Ox>

    static create(...args: unknown[]) {

        const isNamed = isString(args[0])

        const [
            execute

        ] = pluck(args, isFunction<Pipe<object,object>>)

        const [
            name = 'create', 
            method = HttpMethod.Post, 
            path = name === 'create' ? '/' : `/${name}`

        ] = (isNamed
            ? args
            : ['create', ...args]) as [string | undefined, HttpMethod | undefined, Path | undefined]

        return new Command(name, execute, method, path)
    }

    /**
     * Convience interface for defining a GET command named 'get'
     * @param execute - Handle command input to output
     * @returns new GET Command
     */
    static get = <Ix extends object, Ox extends object>(
        execute: Execute<Ix,Ox, 'get'>
    ) => new Command('get', execute, HttpMethod.Get, '/')

    /**
     * Convience interface for defining a GET command named 'find'
     * @param execute - Handle command input to output
     * @returns new GET Command
     */
    static find = <Ix extends object, Ox extends object>(
        execute: Execute<Ix,Ox, 'find'>
    ) => new Command('find', execute, HttpMethod.Get, '/')

    /**
     * Convience interface for defining a DELETE command named 'delete'
     * @param execute - Handle command input to output
     * @returns new DELETE Command
     */
    static delete = <Ix extends object, Ox extends object>(
        execute: Execute<Ix,Ox, 'delete'>
    ) => new Command('delete', execute, HttpMethod.Delete, '/')
        
    /**
     * Convience interface for defining a DELETE command named 'remove'
     * @param execute - Handle command input to output
     * @returns new DELETE Command
     */
    static remove = <Ix extends object, Ox extends object>(
        execute: Execute<Ix,Ox, 'remove'>
    ) => new Command('remove', execute, HttpMethod.Delete, '/')

    /**
     * Convience interface for defining a PATCH command named 'patch'
     * @param execute - Handle command input to output
     * @returns new PATCH Command
     */
    static patch = <Ix extends object, Ox extends object>(
        execute: Execute<Ix,Ox, 'patch'>
    ) => new Command('patch', execute, HttpMethod.Patch, '/')

    /**
     * Convience interface for defining a PATCH command named 'edit'
     * @param execute - Handle command input to output
     * @returns new PATCH Command
     */
    static edit = <Ix extends object, Ox extends object>(
        execute: Execute<Ix,Ox, 'edit'>
    ) => new Command('edit', execute, HttpMethod.Patch, '/')

    /**
     * Convience interface for defining a PUT command named 'update'
     * @param execute - Handle command input to output
     * @returns new PUT Command
     */
    static update = <Ix extends object, Ox extends object>(
        execute: Execute<Ix,Ox, 'update'>
    ) => new Command('update', execute, HttpMethod.Put, '/')

    /**
     * Convience interface for defining a OPTIONS command named 'options'
     * @param execute - Handle command input to output
     * @returns new OPTIONS Command
     */
    static options = <Ix extends object, Ox extends object>(
        execute: Execute<Ix,Ox, 'options'>
    ) => new Command('options', execute, HttpMethod.Options, '/')
        
    //// Sealed ////
    
    private constructor(
        name: N,
        pipe: Execute<I, O, N> | PipeBuilder<I, I, O>,
        readonly method: HttpMethod,
        readonly path: Path
    ) {
        super(name)
        this._pipe = 'build' in pipe ? pipe : pipe.bind(this)
    }

    private _pipe: Execute<I, O, N> | PipeBuilder<I, I, O>

    execute(input: I): O {
        
        if ('build' in this._pipe)
            this._pipe = this._pipe.build()

        return this._pipe(input)
    }

    //// HTTP ////

    /**
     * Chain another execute method onto this command
     */
    pipe<Ox extends object>(execute: Execute<O, Ox, N>): Command<N, I, Ox> {

        const { name, method, path, _pipe } = this

        const builder = 'build' in _pipe ? _pipe : pipe(_pipe)

        return new Command(
            name,
            builder(execute.bind(this)),
            method,
            path
        )
    }

}

//// Exports ////

export default Command

export {
    Command
}