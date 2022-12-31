import { $, Infer, SchemaFor } from '@benzed/schema'
import { 
    Historical,
    HistoryEntry,
    HistoryScribe, 
} from '@benzed/history-scribe'

import { MongoDb, Record } from '../../mongo-db'
import { Client, Server } from '../../connection'

import Command from '../command'
import CommandError from '../command-error'

import { HttpCode } from '../../../util'
import { Node } from '@benzed/ecs'

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

const trees = Node.from(

    Command.create((data: TreeData, cmd) => {
        const trees = cmd
            .assert()
            .inAncestors(db)
            .getCollection('trees')

        const dataWithHistory = HistoryScribe.create(data, '')

        return trees.create(dataWithHistory)
    }),

    Command.update(async ({ id, ...data }: { id: string } & Partial<TreeData>, cmd) => {

        const trees = cmd
            .assert()
            .inAncestors(db)
            .getCollection('trees')

        const existing = await trees.get(id)
        if (!existing)
            throw new CommandError(HttpCode.NotFound, `Tree with id ${id} could not be found.`)

        const updatedData = HistoryScribe.update(existing, data)

        return trees.update(id, updatedData) as Promise<Record<Tree>>
    })

)

const app = Node
    .from(db)
    .set('/trees', trees)

const client = app.add(Client.create())
const server = app.add(Server.create())

//// Setup ////

beforeAll(() => server.start())
beforeAll(() => server.find.require(MongoDb).clearAllCollections())
beforeAll(() => client.start())

afterAll(() => client.stop())
afterAll(() => server.stop())

//// Tests ////

test('get command', async () => {
    
    const trees = client.get('/trees')

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

