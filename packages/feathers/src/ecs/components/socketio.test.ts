import { feathers } from "../builder"
import { SocketIO } from './socketio'

/*** Setup ***/

/*** Tests ***/

it(`adds socket.io provider to App`, () => {
    const ioApp = feathers.add(new SocketIO()).build()
    expect(ioApp.listen).toBeInstanceOf(Function)
})

it.todo(`optionally takes a channel component`)

it(`cant be added twice`, () => {

    expect(
        () => feathers
            .add(new SocketIO())
            .add(new SocketIO())
    ).toThrow(`cannot be used more than once`)

})