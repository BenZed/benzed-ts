import { feathers } from "../app-builder"
import { SocketIO } from './socketio'

/*** Setup ***/

/*** Tests ***/

it(`adds socket.io provider to App`, () => {
    const ioApp = feathers.use(SocketIO).build()
    expect(ioApp.listen).toBeInstanceOf(Function)
})

it(`cant be added twice`, () => {

    expect(
        () => feathers
            .use(SocketIO)
            .use(SocketIO)
    ).toThrow(`cannot be used more than once`)

})