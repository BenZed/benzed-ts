import { Node, Nodes, Modules } from '@benzed/ecs'

//// Main ////

class Service<M extends Modules, N extends Nodes> extends Node<M, N> {

    static create<Nx extends Nodes, Mx extends Modules>(nodes: Nx, ...modules: Mx): Service<Mx,Nx>
    static create<Nx extends Nodes, Mx extends Modules>(...modules: Mx): Service<Mx,Nx>
    static create(...args: unknown[]): unknown {
        return new Service(...Node._sortConstructorParams(args))
    }

}

//// Exports ////

export default Service

export {
    Service
}