import { ObjectId } from 'mongodb'

import { HttpMethod, RequestHandler } from '../util'
import { Command, RuntimeCommand } from './command'

import { io, omit, Pipe } from '@benzed/util'
import $, { Infer } from '@benzed/schema'
import match from '@benzed/match'

import { expectTypeOf } from 'expect-type'
import { it, expect, describe } from '@jest/globals'

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

it('is strongly typed', () => {

    const getTodo = Command.create('getTodo', $todoId)

    type GetTodoTypes = typeof getTodo extends Command<infer N, infer I, infer O> 
        ? { name: N, input: I, output: O}
        : never

    expectTypeOf<GetTodoTypes>().toMatchTypeOf<{
        name: 'getTodo'
        input: TodoId
        output: TodoId
    }>()

})

describe('static builder pattern', () => {

    describe('.create()', () => {

        const todo = { completed: true, id: 'string', description: 'Hey'}
        
        it('generic signature: name, execute, method, path', () => {
            const generic = Command.create(
                'killOrphans',
                $todo,
                HttpMethod.Put,
                '/orphans'
            )

            expect(generic.name).toBe('killOrphans')
            expect(generic.request.method).toBe(HttpMethod.Put)
            expect(generic.request.from(todo)).toHaveProperty('url', '/orphans')
        })

        it('generic signature: name, execute, method', () => {
            const makeRed = Command.create('makeRed', $todo, HttpMethod.Options)
            expect(makeRed.name).toEqual('makeRed')
            expect(makeRed.request.method).toEqual(HttpMethod.Options)
            expect(makeRed.request.from(todo)).toHaveProperty('url', '/make-red')
        })

        it('generic signature: name, execute', () => {
            const create = Command.create('create', $todo)
            expect(create.name).toEqual('create')
            expect(create.request.method).toEqual(HttpMethod.Post)
            expect(create.request.from(todo)).toHaveProperty('url', '/')
        })
    })

    for (const name of ['create', 'get', 'find', 'delete', 'remove', 'patch', 'update', 'options'] as const) {
        describe(`.${name}()`, () => {

            const [method] = match(name)
                .case('create', HttpMethod.Post)
                .case('get', HttpMethod.Get)
                .case('find', HttpMethod.Get)
                .case('delete', HttpMethod.Delete)
                .case ('remove', HttpMethod.Delete)
                .case('patch', HttpMethod.Patch)
                .case('update', HttpMethod.Put)
                .case('options', HttpMethod.Options)

            const cmd = (Command as any)[name](io) as Command<typeof name, object, object>

            it(`name == ${name}`, () => {
                expect(cmd.name).toEqual(name)
            })

            it(`method == ${method}`, () => {
                expect(cmd.request.method).toEqual(method)
            })

            it('url == "/"', () => {
                expect(cmd.request.from({})).toHaveProperty('url', '/')
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

            const todo = await dispatchTodo({ 
                completed: false, 
                description: 'Pipe commands around' 
            })

            expect(todo.id).toBe(id.toString())
            expect(todo.created).toBeInstanceOf(Date)

        })

        it('has access to partial module interface', () => {

            const getTodo = Command
                .get($todoId)
                .useHook(Pipe.convert(function (todo) {

                    expectTypeOf<typeof this>().toMatchTypeOf<RuntimeCommand<TodoId>>()

                    expect(this?.request.method).toEqual(HttpMethod.Get)
                    expect(this?.name).toEqual('get')
                    return todo
                }))

            const todo = getTodo.execute({ id: '0' })
            expect(todo).toEqual({ 
                id: '0', 
            })

            expect.assertions(3)
        })
    })

    describe('useReq', () => {

        const updateTodo = Command
            .patch($todo)

        it('allows mutation of request handler', () => {

            const updateTodoWithNewReq = updateTodo
                .useReq(
                    RequestHandler
                        .create(HttpMethod.Put, $todo)
                        .setUrl`/todos/${'id'}`
                ) 

            const req = updateTodoWithNewReq.request.from({ 
                id: 'first-todo-ever', 
                completed: false, 
                description: 'I will not complete this'
            })

            expect(req).toEqual({
                method: HttpMethod.Put,
                body: { completed: false, description: 'I will not complete this' },
                url: '/todos/first-todo-ever'
            })

        })

        it('mutate signature', () => {

            const updateTodoWithNewReq = updateTodo
                .useReq(req => req.setUrl`/todos/edit/${'id'}`)

            expect(updateTodoWithNewReq.request.from({
                id: 'great-todo', 
                completed: false, 
                description: 'Do the thing'
            })).toEqual({
                method: HttpMethod.Patch,
                body: { completed: false, description:'Do the thing' },
                url: '/todos/edit/great-todo'
            })
        })
    })
})

describe('name', () => {

    it('must be camelCased', () => {
        expect(() => Command.create('holy-mackarel', $todo))
            .toThrow('must be in camelCase')
    })

    it('is typed', () => {
        const killOrphans = Command.create('killOrphans', $todo)
        type KillOrphans = typeof killOrphans
        type KillOrphansName = KillOrphans extends Command<infer N, any, any> ? N : never 
        expectTypeOf<KillOrphansName>().toEqualTypeOf<'killOrphans'>()
    })

})

describe('hook instead of schema', () => {

    it('allows non-validated commands to be created', () => {

        const cmd = Command.get((i: { input: string }) => ({ ...i, foo: 'bar' }))

        expect(cmd.execute({ input: 'hello' })).toEqual({ 
            foo: 'bar', 
            input: 'hello' 
        })

        expect(cmd.request.from({ input: 'x' })).toEqual({ 
            url: '/?input=x',
            method: HttpMethod.Get,
        })
    })

})

describe('shape schema input', () => {

    it('allows slightly nicer validation syntax', () => {

        const cmd1 = Command.get({
            x: $.number,
            y: $.number
        })
        
        const cmd = cmd1.useHook(({ x,y }) => ({ magnitude:  Math.sqrt(x ** 2 + y ** 2)}))
        expect(cmd.execute({ x: 0, y: 10 }))
            .toEqual({ magnitude: 10 })
    })
    
    it('does stuff', () => {
        //
        //
    })

})
