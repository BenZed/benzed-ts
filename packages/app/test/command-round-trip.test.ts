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
        
        for (const [{ name, ...data }, output] of [

            [ { name: `add` , a: 10, b: 10 }, { result: 20 } ],
            [ { name: `multiply` , a: 10, b: 10 }, { result: 100 } ],
            [ { name: `divide` , a: 10, b: 10 }, { result: 1 } ],
            [ { name: `subtract` , a: 10, b: 10 }, { result: 0 } ],

        ] as const) {
            it(`calculator ${name} test ${data} should result in ${JSON.stringify(output)}`, async () => {

                const result = await client.execute(name, data)
                expect(result).toEqual(output)
            })
        }
    })
}