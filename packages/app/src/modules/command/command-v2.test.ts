
import $, { Infer } from '@benzed/schema'

import { HttpMethod } from '../../util'
import { Command } from './command-v2'

import { it, expect, describe } from '@jest/globals'

import { expectTypeOf } from 'expect-type'
import { ObjectId } from 'mongodb'
import { omit } from '@benzed/util'

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
    
})