import { Node } from '@benzed/ecs'
import { $ } from '@benzed/schema'
import { through } from '@benzed/util'
import { 
    Client, 
    Command, 
    CommandError, 
    HttpCode, 
    Server 
} from '../src'

for (const clientWebSocket of [true, false]) {
    for (const serverWebSocket of [true, false]) {
        describe(`client ${clientWebSocket ? 'websocket' : 'rest'} server ${serverWebSocket ? 'websocket' : 'rest'}`, () => {

            //// Nodes //// 

            const foobar = $('foo', 'bar')

            const app = Node.create(
                Command.put({ code: $.number }, ({ code }: { code: number }) => {
                    if (code < 400)
                        return { success: code }
                    throw new CommandError(
                        code,
                        `Testing error code: ${code}`
                    )
                }),

                Command.get({ 
                    option: foobar
                })
            )

            const server = app.addModule(Server.create({ webSocket: serverWebSocket }))
            const client = app.addModule(Client.create({ webSocket: clientWebSocket }))

            //// Setup ////

            beforeAll(() => server.assertModule(Server).start())
            beforeAll(() => client.assertModule(Client).start())
 
            afterAll(() => client.assertModule(Client).stop())
            afterAll(() => server.assertModule(Server).stop())

            //// Tests ////

            const errorTest = async (code: HttpCode): Promise<unknown> => {
                try {
                    await client.commands.errorCodeTest({ code })
                } catch(e) {
                    return e
                }

                throw new Error(`${code} did not throw.`)
            } 

            describe('names from status codes', () => {
 
                for (const key in HttpCode) {
                    const code = parseInt(key)
                    if (!isNaN(code) && code >= HttpCode.BadRequest) {

                        const name = HttpCode[code]

                        it(`${code} ${name}`, async () => {
                            const err = await errorTest(code)
                            expect(err).toHaveProperty('name', name)
                            expect(err).toHaveProperty('code', code)
                        })
                    }
                }
            })

            it('converts validation errors to command errors', async () => {
                // @ts-expect-error must be foo or bar
                const error = await client.commands.validationErrorTest({ option: 'bar1' }).catch(through)

                expect(error).toHaveProperty('code', HttpCode.BadRequest)
                expect(error).toHaveProperty('name', 'BadRequest')
                expect(error).toHaveProperty('message', 'option must be foo or bar')
                expect(error).toHaveProperty('data', {
                    path: ['option'],
                    value: 'bar1',
                })
            })

            it('throws if command cannot be found, http/websocket', async () => {

                const error = await client.assertModule(Client)._execute(
                    Command.put({}),
                    {},
                ).catch(through)

                expect(error).toHaveProperty('code', HttpCode.NotFound)
                expect(error).toHaveProperty('name', 'NotFound')
                expect(error).toHaveProperty('message', clientWebSocket && serverWebSocket
                    ? 'Could not find command \'nonExistantCommand\''
                    : 'Could not PUT /non-existant-command')
            })

            if (!serverWebSocket || !clientWebSocket) {
                it('throws "method not allowed" if no command uses method', async () => {
                    
                    const badMethod = await client.assertModule(Client)._execute(
                        Command.post({}),
                        {},
                    )//.catch(through)

                    expect(badMethod).toHaveProperty('code', HttpCode.MethodNotAllowed)
                    expect(badMethod).toHaveProperty('name', 'MethodNotAllowed')
                    expect(badMethod).toHaveProperty('message', 'Method POST is not allowed')
                })
            }
        })
    }
}