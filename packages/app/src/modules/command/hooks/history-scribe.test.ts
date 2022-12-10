import { $, Infer, SchemaFor } from '@benzed/schema'
import { 
    Historical,
    HistoryEntry,
    HistoryScribe, 
} from '@benzed/history-scribe'

import { MongoDb, Record } from '../../mongo-db'
import { Client, Server } from '../../connection'
import { Service } from '../../../service'
import { App } from '../../../app'

import Command from '../command'
import CommandError from '../command-error'

import { HttpCode } from '../../../util'

/* eslint-disable 
    @typescript-eslint/explicit-function-return-type
*/

//// ECS ////

const $state = $.enum('protected', 'marked-for-logging', 'logged')

interface TreeData extends Infer<typeof $treeData> {}
const $treeData = $({
    leaves: $.number,
    height: $.number,
    state: $state,
    type: $.string
})

interface Tree extends TreeData, Historical<TreeData> {}
const $tree = $({
    ...$treeData.$,
    history: $.array($.object) as unknown as SchemaFor<HistoryEntry<Tree>[]>
})

const db = MongoDb
    .create({ database: 'history-scribe-test' })
    .addCollection<'trees', Tree>('trees', $tree)

const trees = Service
    .create()
    .useModules(

        Command.create((data: TreeData, cmd) => {
            const trees = cmd
                .findModule<typeof db, true>(MongoDb, true, 'parents')
                .getCollection('trees')

            const dataWithHistory = HistoryScribe
                .create<TreeData, string>(data)
                .compile()

            return trees.create(dataWithHistory)
        }),

        Command.update(async ({ id, ...data }: { id: string } & Partial<TreeData>, cmd) => {

            const trees = cmd
                .findModule<typeof db, true>(MongoDb, true, 'parents')
                .getCollection('trees')

            const existing = await trees.get(id)
            if (!existing)
                throw new CommandError(HttpCode.NotFound, `Tree with id ${id} could not be found.`)

            const updatedData = HistoryScribe
                .from(existing.history)
                .update(data)
                .compile()

            return trees.update(id, updatedData) as Promise<Record<Tree>>
        })

    )

const app = App
    .create()
    .useModule(db)
    .useService('/trees', trees)

const client = app.useModule(Client.create())
const server = app.useModule(Server.create())

//// Setup ////

beforeAll(() => server.start())
beforeAll(() => server.findModule(MongoDb, true).clearAllCollections())
beforeAll(() => client.start())

afterAll(() => client.stop())
afterAll(() => server.stop())

//// Tests ////

test('get command', async () => {
    
    const trees = client.getService('/trees')

    const newTree = await trees.commands.create({
        leaves: 100,
        height: 4,
        state: 'protected',
        type: 'spruce'
    })

    const updatedTree = await trees.commands.update({
        id: newTree._id,
        leaves: 250
    })

    console.log(...updatedTree.history)
    console.log(updatedTree)
    
})

