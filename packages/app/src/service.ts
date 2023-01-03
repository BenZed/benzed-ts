import { Node, Nodes, Modules } from '@benzed/ecs'

import { AppModule } from './app-module'
import { Command, CommandList } from './app-modules'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Main ////

class Service<M extends Modules = any, N extends Nodes = any> extends Node<M, N> {

    static override create<Nx extends Nodes, Mx extends Modules>(nodes: Nx, ...modules: Mx): Service<Mx,Nx>
    static override create<Nx extends Nodes, Mx extends Modules>(...modules: Mx): Service<Mx,Nx>
    static override create(...args: unknown[]): unknown {
        return new Service(...this._sortConstructorParams(args))
    }

    get commands(): CommandList<N> {
        return Command.list(this)
    }

    async start(): Promise<void> {

        for (const appModule of this.root.findModules.inSelf.or.inDescendents(AppModule))
            await appModule.start()
    }

    async stop(): Promise<void> {
        for (const appModule of this.root.findModules.inSelf.or.inDescendents(AppModule))
            await appModule.stop()
    }

}

//// Exports ////

export default Service

export {
    Service
}