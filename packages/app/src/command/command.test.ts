import { ObjectId } from 'mongodb'

import { Module } from '../module'
import { HttpMethod } from '../modules'
import { Command, RuntimeCommand } from './command'

import { omit } from '@benzed/util'
import match from '@benzed/match'
import $, { Infer } from '@benzed/schema'

import { expectTypeOf } from 'expect-type'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Todo ////

// interface TodoData extends Infer<typeof $todoData> {}
const $todoData = $({
    completed: $.boolean,
    description: $.string
})

interface TodoId extends Infer<typeof $todoId> {}
const $todoId = $({
    id: $.string
})

// interface Todo extends Infer<typeof $todo> {}
const $todo = $({
    ...$todoId.$,
    ...$todoData.$
})

//// Tests ////

it('is sealed', () => {
    // @ts-expect-error Sealed
    void class extends Command<'bad', object, object> {}
})

it('is a module', () => {
    const getTodo = Command.create('get-todo', $todoId)

    expect(getTodo).toBeInstanceOf(Module)
})

it('is strongly typed', () => {

    const getTodo = Command.create('get-todo', $todoId)

    type GetTodoTypes = typeof getTodo extends Command<infer N, infer I, infer O> 
        ? { name: N, input: I, output: O}
        : never

    expectTypeOf<GetTodoTypes>().toMatchTypeOf<{
        name: 'get-todo'
        input: TodoId
        output: TodoId
    }>()

})

describe('static builder pattern', () => {

    describe('.create()', () => {
        
        it('generic signature: name, execute, method, path', () => {
            const generic = Command.create(
                'kill-orphans',
                $todo,
                HttpMethod.Put,
                '/orphans'
            )

            expect(generic.http.method).toBe(HttpMethod.Put)
            expect(generic.http.path).toBe('/orphans')
            expect(generic.name).toBe('kill-orphans')
        })

        it('generic signature: name, execute, method', () => {
            const makeRed = Command.create('make-red', $todo, HttpMethod.Options)
            expect(makeRed.name).toEqual('make-red')
            expect(makeRed.http.method).toEqual(HttpMethod.Options)
            expect(makeRed.http.path).toEqual('/make-red')
        })

        it('generic signature: name, execute', () => {
            const create = Command.create('create', $todo)
            expect(create.name).toEqual('create')
            expect(create.http.method).toEqual(HttpMethod.Post)
            expect(create.http.path).toEqual('/')
        })

    })

    for (const name of ['create', 'get', 'find', 'delete', 'remove', 'patch', 'edit', 'update', 'options'] as const) {
        describe(`.${name}()`, () => {

            const [method] = match(name)
            ('create', HttpMethod.Post)
            ('get', HttpMethod.Get)
            ('find', HttpMethod.Get)
            ('delete', HttpMethod.Delete)
            ('remove', HttpMethod.Delete)
            ('patch', HttpMethod.Patch)
            ('edit', HttpMethod.Patch)
            ('update', HttpMethod.Put)
            ('options', HttpMethod.Options)

            const cmd = (Command as any)[name]($todo)

            it(`name == ${name}`, () => {
                expect(cmd.name).toEqual(name)
            })

            it(`method == ${method}`, () => {
                expect(cmd.http.method).toEqual(method)
            })

            it('path == "/"', () => {
                expect(cmd.http.path).toEqual('/')
            })

        })
    }
})

describe('instance builder pattern', () => {

    describe('.useHook()', () => {

        it('append a hook method, changing the commands output', async () => {

            const id = new ObjectId()

            const getTodo = Command
                .create($todoData)

            const dispatchTodo = getTodo

                // add id
                .useHook(data => ({ ...data, id: id.toString() }))

                // set created timestamp
                .useHook(data => ({ ...data, created: new Date() }))

                // remove complete
                .useHook(omit('completed'))

            const todo = await dispatchTodo.execute({ completed: false, description: 'Pipe commands around' })

            expect(todo.id).toBe(id.toString())
            expect(todo.created).toBeInstanceOf(Date)

        })

        it('has access to partial module interface', () => {

            const getTodo = Command
                .get($todoId)
                .useHook(function (todo) {

                    expectTypeOf<typeof this>().toMatchTypeOf<RuntimeCommand<TodoId>>()

                    expect(this?.http.method).toEqual(HttpMethod.Get)
                    expect(this?.name).toEqual('get')
                    return todo
                })

            const todo = getTodo.execute({ id: '0' })
            expect(todo).toEqual({ 
                id: '0', 
            })

            expect.assertions(3)
        })
    })

    describe('.dispatch()', () => {
        it.todo('applies a supplied hook method if the output is being returned to a client')
    })

})

describe('name', () => {

    it('must be dash-cased', () => {
        expect(() => Command.create('HolyMackaral', $todo))
            .toThrow('must be dash-cased')
    })

    it('is typed', () => {
        const killOrphans = Command.create('kill-orphans', $todo)
        type KillOrphans = typeof killOrphans
        type KillOrphansName = KillOrphans extends Command<infer N, any, any> ? N : never 
        expectTypeOf<KillOrphansName>().toEqualTypeOf<'kill-orphans'>()
    })

})