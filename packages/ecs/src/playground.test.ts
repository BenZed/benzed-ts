
import { Node } from './node'
import { Component } from './component'

class Rest extends Component<'rest'> {
    protected readonly _name = 'rest'
}

class SocketIo extends Component<'socket-io'> {
    protected readonly _name = 'socket-io'
}

type Providers = Rest | SocketIo

class Server<
    C extends readonly Providers[] = [], 
    N extends readonly Server[] = []
> extends Node<C, N> {
    
}

class _BadNode extends Component<'not-a-server-node'> {
    protected readonly _name = 'not-a-server-node'
}
const node = new Node(new Rest())
    .addComponent(new _BadNode())

const server = new Server()
