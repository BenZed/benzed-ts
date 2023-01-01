import { Node, Nodes, Modules } from '@benzed/ecs'

import { AppModule } from './app-module'
import { Command, CommandList } from './app-modules'

//// Main ////

class Service<M extends Modules, N extends Nodes> extends Node<M, N> {

    static create<Nx extends Nodes, Mx extends Modules>(nodes: Nx, ...modules: Mx): Service<Mx,Nx>
    static create<Nx extends Nodes, Mx extends Modules>(...modules: Mx): Service<Mx,Nx>
    static create(...args: unknown[]): unknown {
        return new Service(...Node._sortConstructorParams(args))
    }

    get commands(): CommandList<M,N> {
        return Command.list(this)
    }

    async start(): Promise<void> {
        for (const appModule of this.findModules.inTree(AppModule))
            await appModule.start()
    }

    async stop(): Promise<void> {
        for (const appModule of this.findModules.inTree(AppModule))
            await appModule.stop()
    }

}

//// Exports ////

export default Service

export {
    Service
}