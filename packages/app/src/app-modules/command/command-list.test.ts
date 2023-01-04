import { Node } from '@benzed/ecs'
import { $ } from '@benzed/schema'

import { Command } from './command'

import { expectTypeOf } from 'expect-type'

//// Setup ////

const service = Node.create({
    get: Command.get({ id: $.string }),  
    find: Command.get({ query: $.record($.string) }),
    update: Command.patch({ id: $.string, data: $.record($.string) }),
    create: Command.post({ data: $.record($.string) }),
    remove: Command.delete({ id: $.string }),
    dummy: Node.create()
})

const app = Node.create({
    service,
    auth: Command.put({ credentials: $.string })
})

const commands = Command.list(app)
type Commands = typeof commands

//// Tests ////

it('an object containing only nested commands', async () => {
    await expect(commands.service.get({ id: '0' })).resolves.toEqual({ id: '0' })
    await expect(commands.service.find({ query: {} })).resolves.toEqual({ query: {} })
    await expect(commands.service.update({ id: '0', data: {} })).resolves.toEqual({ id: '0', data: {} })
    await expect(commands.service.create({ data: {} })).resolves.toEqual({ data: {} })
    await expect(commands.service.remove({ id: '0' })).resolves.toEqual({ id: '0' })
    await expect(commands.auth({ credentials: 'password' })).resolves.toEqual({ credentials: 'password' })
})

it('is typesafe', () => {
    expectTypeOf<Commands['service']['get']>()
        .toEqualTypeOf<Command<{ id: string }, { id: string }>>()

    expectTypeOf<Commands['auth']>()
        .toEqualTypeOf<Command<{ credentials: string }, { credentials: string }>>()
})

it('nodes without commands are omitted', () => {
    expect(commands.service).not.toHaveProperty('dummy')

    type D1 = Commands['service'] extends { dummy: infer D } ? D : never
    expectTypeOf<D1>().toEqualTypeOf<never>()
})