import { isNaN } from '@benzed/util'
import { 
    App, 
    Client, 
    Command, 
    CommandError, 
    HttpCode, 
    Server 
} from '../src'

for (const clientWebSocket of [true, false]) {
    for (const serverWebSocket of [true, false]) {
        describe(`client websocket ${clientWebSocket ? 'enabled' : 'disabled'} server websocket ${serverWebSocket ? 'enabled' : 'disabled'}`, () => {

            //// Nodes ////

            const app = App.create()
                .useModules(
                    Command.create('errorTest', ({ code }: { code: number }) => {
                        if (code < 400)
                            return { success: code }
                        throw new CommandError(
                            code,
                            `Testing error code: ${code}`
                        )
                    })
                )

            const server = app.useModule(Server.create({ webSocket: serverWebSocket }))
            const client = app.useModule(Client.create({ webSocket: clientWebSocket }))

            //// Setup ////

            beforeAll(() => server.start())
            beforeAll(() => client.start())
 
            afterAll(() => client.stop())
            afterAll(() => server.stop())

            //// Tests ////

            const errorTest = async (code: HttpCode): Promise<unknown> => {
                try {
                    console.log(await client.commands.errorTest({ code }))
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

            it.todo('throws if command cannot be found, http/websocket')
            it.todo('throws if method is not allowed')

        })
    }
}