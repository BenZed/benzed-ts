import { Node } from './node'
import { System } from './system'
import { Component } from './component'

/*** Components ***/

class Rest extends Component<{request: string}, { response: string }> {
    
    public execute(input: { request: string }): { response: string } {
        return { response: input.request }
    }
}

class SocketIo extends Component<{connection: string}, void> {
    public execute(input: { connection: string }): void {
        return void input
    }
}

class Listener extends Component<void, { request: string}> {
    public execute(): { request: string } {
        return { request: 'hello world' }
    }
}

class Responder extends Component<{ response: string }, void> {
    public execute(input: { response: string }) : void {
        void input
    }
}

/*** Types ***/

const listener = Node.create(new Listener())
const responder = Node.create(new Responder())
const rest = Node.create(new Rest())
const socketio = Node.create(new SocketIo())

/*** Tests ***/

it('adds a table of linkable nodes', () => {

    const server = System
        .create({ listener })
        .add('listener', { rest })
        .add('rest', { responder })

    expect(server.nodes).toHaveProperty('connection')
    expect(server.nodes).toHaveProperty('rest')
    expect(server.nodes).toHaveProperty('socketio')
    expect(server.links).toContain(['connection', 'rest'])
})

it('can only connect nodes with applicable input', () => {
    const server = System
        .create({ listener, socketio })
        // @ts-expect-error should not be able to link to socketio
        .link('listener', 'socketio')
    
})
