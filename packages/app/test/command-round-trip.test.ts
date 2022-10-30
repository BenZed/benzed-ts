import { Calculator } from './util.test'
import { App } from '../src'

/*** Setup ***/

for (const webSocket of [true, false]) {

    describe(`websocket ${webSocket ? `enabled` : `disabled`}`, () => {

        const app = App.create().use(new Calculator())
        const client = app.client({ webSocket })
        const server = app.server({ webSocket })
        
        beforeAll(() => server.start())
        beforeAll(() => client.start())
        
        afterAll(() => server.stop())
        afterAll(() => client.stop())

        /*** Tests ***/
        
        for (const [command, output] of [

            [ { name: `add` , values: [10,10] }, { result: 20 } ],
            [ { name: `multiply` , values: [10,10] }, { result: 100 } ],
            [ { name: `divide` , values: [10,10] }, { result: 1 } ],
            [ { name: `subtract` , values: [10,10] }, { result: 0 } ],

        ]) {
            it(`calculator ${command.name} test ${command.values} should result in ${JSON.stringify(output)}`, async () => {
                const result = await client.execute(command)
                expect(result).toEqual(output)
            })
        }
    })

}