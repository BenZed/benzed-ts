import { ObjectId } from 'mongodb'

import $, { Infer } from '@benzed/schema'
import { io, omit, Pipe } from '@benzed/util'
import { match } from '@benzed/match'
import { ExecuteContext } from '@benzed/ecs'

import { Command, CommandContext } from './command'

import { RequestHandler } from '../request-handler'
import { Name } from './name'

import { HttpMethod } from '../../util'
import { it, expect, describe } from '@jest/globals'

import { expectTypeOf } from 'expect-type'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

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
        expect(generic.httpMethod).toBe(HttpMethod.Put)
        expect(generic.reqFromData(todo)).toHaveProperty('url', '/orphans')
    })

    it('generic signature: name, execute, method', () => {
        const makeRed = Command.create('makeRed', $todo, HttpMethod.Options)
        expect(makeRed.name).toEqual('makeRed')
        expect(makeRed.httpMethod).toEqual(HttpMethod.Options)
        expect(makeRed.reqFromData(todo)).toHaveProperty('url', '/make-red')
    })

    it('generic signature: name, execute', () => {
        const create = Command.create('create', $todo)
        expect(create.name).toEqual('create')
        expect(create.httpMethod).toEqual(HttpMethod.Post)
        expect(create.reqFromData(todo)).toHaveProperty('url', '/')
    })

})

describe('.appendHook()', () => { 

    it('append a hook method, changing the commands output', async () => {

        const id = new ObjectId()
        const getTodo = Command.create($todoData)
        const dispatchTodo = getTodo
            // add id
            .appendHook(data => ({ ...data, id: id.toString() }))
            // set created timestamp
            .appendHook(data => ({ ...data, created: new Date() }))
            // remove complete
            .appendHook(omit('completed'))

        const todo = await dispatchTodo({
            completed: false, 
            description: 'Pipe commands around' 
        })

        expect(todo.id).toBe(id.toString())
        expect(todo.created).toBeInstanceOf(Date)
    })

    it('has access to partial module interface', async () => {

        const getTodo = Command
            .create('get', $todoId, HttpMethod.Get)
            .appendHook(Pipe.convert(function (todo) {

                expectTypeOf<typeof this>().toMatchTypeOf<ExecuteContext<CommandContext>>()

                expect(this.find(RequestHandler)?.method).toEqual(HttpMethod.Get)
                expect(this.find(Name)?.getName()).toEqual('get')
                return todo
            }))

        const todo = await getTodo({ id: '0' })
        expect(todo).toEqual({ id: '0' })

        expect.assertions(3)
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
            expect(cmd.httpMethod).toEqual(method)
        })

        it('url == "/"', () => {
            expect(cmd.reqFromData({})).toHaveProperty('url', '/')
        })
    })
}

describe('useReq', () => {

    const updateTodo = Command.create('update', $todo, HttpMethod.Patch)

    it('allows mutation of request handler', () => {

        const updateTodoWithNewReq = updateTodo
            .setReq(
                RequestHandler
                    .create(HttpMethod.Put, $todo)
                    .setUrl`/todos/${'id'}`
            ) 

        const req = updateTodoWithNewReq.reqFromData({ 
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
            .setReq(req => req.setUrl`/todos/edit/${'id'}`)

        expect(updateTodoWithNewReq.reqFromData({
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

    it('allows non-validated commands to be created', async () => {

        const cmd = Command.create(
            'get', 
            (i: { input: string }) => ({ ...i, foo: 'bar' }),
            HttpMethod.Get,
            '/'
        )

        expect(await cmd({ input: 'hello' })).toEqual({ 
            foo: 'bar', 
            input: 'hello' 
        })

        expect(cmd.reqFromData({ input: 'x' })).toEqual({ 
            url: '/?input=x',
            method: HttpMethod.Get,
        })
    })
})

describe('shape schema input', () => {

    it('allows slightly nicer validation syntax', async () => {

        const cmd1 = Command.create({
            x: $.number,
            y: $.number
        })
        
        const cmd = cmd1.appendHook(({ x,y }) => ({ magnitude:  Math.sqrt(x ** 2 + y ** 2)}))
        expect(await cmd({ x: 0, y: 10 })).toEqual({ magnitude: 10 })
    })

})
