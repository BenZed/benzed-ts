import { ObjectId } from 'mongodb'

import { Command, RuntimeCommand } from './command'

import { Module } from '../module'
import { HttpMethod, Id } from '../modules'

import match from '@benzed/match'
import { omit } from '@benzed/util'

import { expectTypeOf } from 'expect-type'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Todo ////

type TodoId = { id: Id }
type Todo = { id: Id, completed: boolean, description: string }
const todo: Todo = { id: '001', completed: true, description: 'Create a command builder pattern interface' }

//// Tests ////

it('is sealed', () => {
    // @ts-expect-error Sealed
    void class extends Command<'bad', object, object> {}
})

it('is a module', () => {
    const getTodo = Command.create('get-todo', (i: TodoId) => ({ ...i, ...todo }))
    expect(getTodo).toBeInstanceOf(Module)
})

it('is strongly typed', () => {

    const getTodo = Command.create('get-todo', (i: TodoId) => ({ ...i, ...todo }))

    type GetTodoTypes = typeof getTodo extends Command<infer N, infer I, infer O> 
        ? { name: N, input: I, output: O}
        : never

    expectTypeOf<GetTodoTypes>().toEqualTypeOf<{
        name: 'get-todo'
        input: TodoId
        output: Todo
    }>()

})

describe('static builder pattern', () => {

    const completeImportantTodo = (id: TodoId): Todo =>     
        ({ ...id, ...todo, description: 'Kill all the orphans' })

    describe('.create()', () => {
        
        it('generic signature: name, execute, method, path', () => {
            const generic = Command.create(
                'kill-orphans',
                completeImportantTodo,
                HttpMethod.Put,
                '/orphans'
            )

            expect(generic.method).toBe(HttpMethod.Put)
            expect(generic.path).toBe('/orphans')
            expect(generic.name).toBe('kill-orphans')
        })

        it('generic signature: name, execute, method', () => {
            const makeRed = Command.create('make-red', completeImportantTodo, HttpMethod.Options)
            expect(makeRed.name).toEqual('make-red')
            expect(makeRed.method).toEqual(HttpMethod.Options)
            expect(makeRed.path).toEqual('/make-red')
        })

        it('generic signature: name, execute', () => {
            const create = Command.create('create', completeImportantTodo)
            expect(create.name).toEqual('create')
            expect(create.method).toEqual(HttpMethod.Post)
            expect(create.path).toEqual('/')
        })

        it('has access to module interface', () => {

            Command.create(
                'has-module-interface',
                function(id: TodoId) {

                    expect(this.name).toEqual('has-module-interface')
                    expect(this.method).toEqual(HttpMethod.Post)
                    expect(this.path).toEqual('/has-module-interface')

                    return id
                }).execute({ id: '0' })

            expect.assertions(3)
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

            const cmd = (Command as any)[name](completeImportantTodo)

            it(`name == ${name}`, () => {
                expect(cmd.name).toEqual(name)
            })

            it(`method == ${method}`, () => {
                expect(cmd.method).toEqual(method)
            })

            it('path == "/"', () => {
                expect(cmd.path).toEqual('/')
            })

            it('has access to the module interface', () => {

                (Command as any)[name](function(this: any, todo: TodoId) {

                    expect(this?.method).toEqual(method)
                    expect(this?.name).toEqual(name)
                    expect(this).toBeInstanceOf(Command)

                    return todo
                }).execute({ id: '0' })

                expect.assertions(3)

            })
        })
    }

})

describe('instance builder pattern', () => {

    describe('.pipe()', () => {

        it('pipe an additional execute method, changing the commands output', () => {

            const id = new ObjectId()

            const getTodo = Command
                .create((data: Omit<Todo, 'id'>) => ({
                    ...data,
                    id
                }))

            const dispatchTodo = getTodo
                // convert id to string
                .pipe(data => ({ ...data, id: data.id.toString() }))
                // set created timestamp
                .pipe(data => ({ ...data, created: new Date() }))
                // remove complete
                .pipe(omit('completed'))

            const todo = dispatchTodo.execute({ completed: false, description: 'Pipe commands around' })

            expect(todo.id).toBe(id.toString())
            expect(todo.created).toBeInstanceOf(Date)

        })

        it('has access to partial module interface', () => {

            const getTodo = Command
                .get(function (id: TodoId) {
                    expect(this).toBeInstanceOf(Command)
                    return {
                        ...id,
                        completed: true,
                        description: this.name as string
                    }
                })
                .pipe(function (todo) {

                    expectTypeOf<typeof this>().toMatchTypeOf<RuntimeCommand<'get', Todo>>()

                    expect(this?.method).toEqual(HttpMethod.Get)
                    expect(this?.name).toEqual('get')
                    return todo
                })

            const todo = getTodo.execute({ id: '0' })
            expect(todo).toEqual({ 
                id: '0', 
                completed: true, 
                description: 'get' 
            })

            expect.assertions(4)
        })

    })
})

describe('name', () => {

    it('must be dash-cased', () => {
        expect(() => Command.create('HolyMackaral', i => i))
            .toThrow('must be dash-cased')
    })

    it('is typed', () => {
        const killOrphans = Command.create('kill-orphans', i => i)
        type KillOrphans = typeof killOrphans
        type KillOrphansName = KillOrphans extends Command<infer N, any, any> ? N : never 
        expectTypeOf<KillOrphansName>().toEqualTypeOf<'kill-orphans'>()
    })

})