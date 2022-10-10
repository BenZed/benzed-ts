import { Node } from './node'
import { Graph } from './graph'
import { Component } from './component'

class Rest extends Component<'rest'> {
    protected readonly _name = 'rest'
}

class SocketIo extends Component<'socket-io'> {
    protected readonly _name = 'socket-io'
}

class Listener extends Component<'listener'> {
    protected readonly _name = 'listener'
}

type Provider = Node<[Rest, SocketIo]>

const listener = Node.create(new Listener())

const provider: Provider = Node.create(new Rest(), new SocketIo())

it('adds a table of linkable nodes', () => {

    const server = Graph
        .create({ listener })
        .add('listener', { provider })

})
