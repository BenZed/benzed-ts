import { Node, NodeOutput } from './node'
import { System, SystemOutput } from './system'
import { Component } from './component'
import { expectTypeOf } from 'expect-type'

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

const responder = Node.create(new Responder())
const listener = Node.create(new Listener())

const socketio = Node.create(new SocketIo())
const rest = Node.create(new Rest())

/*** Tests ***/

it('allows a table of nodes to be linked together', () => {

    const server = System.create({ listener, rest, responder})
        .link('listener', 'rest')
        .link('rest', 'responder')

})

it('nodes can be added after the fact', () => {

    const server = System
        .create({ listener })
        .add('listener', { rest })
        .add('rest', { responder })

    expect(server.nodes).toHaveProperty('listener')
    expect(server.nodes).toHaveProperty('rest')

    expect(server.links).toEqual([['listener', 'rest'], ['rest', 'responder']])
})

it('can only connect nodes with applicable input', () => {
    System
        .create({ listener, socketio })
        // @ts-expect-error Cant link listener to socketio
        .link('listener', 'socketio')
    
})

it('systems can be linked', () => {
    
    type Provider = System<{ rest: Node<[Rest]> }, [], 'rest'>
    const provider: Provider = System
        .create({ rest })
        .setInputNode('rest')

    const server1 = System   
        .create({ listener, responder, provider })
        .link('listener', 'provider')
        .link('provider', 'responder')

    const server2 = System  
        .create({ listener })
        .add('listener', { provider })
        .add('provider', { responder })

    expect(server1).toEqual(server2)
})

it('correct calculation of system output', () => {

    const provider = System 
        .create({ rest })
        .add('rest', { responder })
        .setInputNode('rest')

        type ProviderOutput = SystemOutput<typeof provider>
        type ResponderOutput = NodeOutput<typeof responder>

        expectTypeOf<ProviderOutput>().toMatchTypeOf<ResponderOutput>()
})