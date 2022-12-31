import { Node } from '@benzed/ecs'
import { $ } from '@benzed/schema'

import { Command } from './command'

import { expectTypeOf } from 'expect-type'
import { HttpMethod } from '../../util'

//// Setup ////

const service = Node.create({
    get: Node.create(Command.get({ id: $.string })),
    find: Node.create(Command.get({ query: $.object })),
    update: Node.create(Command.patch({ id: $.string, data: $.object })),
    create: Node.create(Command.post({ data: $.object })),
    remove: Node.create(Command.delete({ id: $.string })),
    dummy: Node.create()
})

const app = Node.create({
    service,
    auth: Node.create(Command.put({ credentials: $.string }))
})

const commands = Command.list(app)
type Commands = typeof commands

//// Tests ////

it('an object containing only nested commands', () => {
    expect(commands.service.get({ id: '0' }, {})).toEqual({ id: '0' })
    expect(commands.service.find({ query: {} }, {})).toEqual({ query: {} })
    expect(commands.service.update({ id: '0', data: {} }, {})).toEqual({ id: '0', data: {} })
    expect(commands.service.create({ data: {} }, {})).toEqual({ data: {} })
    expect(commands.service.remove({ id: '0' }, {})).toEqual({ id: '0' })
    expect(commands.auth({ credentials: 'password' }, {})).toEqual({ credentials: 'password' })
})

it('is typesafe', () => {
    expectTypeOf<Commands['service']['get']>()
        .toEqualTypeOf<Command<HttpMethod.Get, { id: string }, { id: string }>>()

    expectTypeOf<Commands['auth']>()
        .toEqualTypeOf<Command<HttpMethod.Put, { credentials: string }, { credentials: string }>>()
})

it('nodes without commands are omitted', () => {
    expect(commands.service).not.toHaveProperty('dummy')

    type D1 = Commands['service'] extends { dummy: infer D } ? D : never
    expectTypeOf<D1>().toEqualTypeOf<never>()
})