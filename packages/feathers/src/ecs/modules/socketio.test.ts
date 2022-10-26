import { feathers } from "../builder"
import { SocketIO } from './socketio'

/*** Setup ***/

/*** Tests ***/

it(`adds socket.io provider to App`, () => {
    const ioApp = feathers.add(SocketIO).build()
    expect(ioApp.listen).toBeInstanceOf(Function)
})

it(`cant be added twice`, () => {

    expect(
        () => feathers
            .add(SocketIO)
            .add(SocketIO)
    ).toThrow(`cannot be used more than once`)

})