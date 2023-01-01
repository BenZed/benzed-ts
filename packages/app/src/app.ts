import { AddModules, Module, Modules, Nodes } from '@benzed/ecs'

import { AppModule, AppModules } from './app-module'
import { Client, Server } from './app-modules'

import Service from './service'

//// Type ////

type Services = {
    [key: string]: Service<Modules, Nodes>
}

//// Main ////

class App<M extends readonly AppModule[], S extends Services> extends Service<M,S> {

    static override create<Sx extends Services, Mx extends AppModules>(nodes: Sx, ...modules: Mx): App<Mx,Sx>
    static override create<Sx extends Services, Mx extends AppModules>(...modules: Mx): App<Mx,Sx>
    static override create(...args: unknown[]): unknown {
        return new App(...this._sortConstructorParams(args, AppModule, Service))
    }

    asClient(): App<AddModules<M, [Client]>, S> {
        return App.create(
            this.nodes, 
            ...Module.add(this.modules, Client.create())
        )
    }

    asServer(): App<AddModules<M, [Server]>, S> {
        return App.create(
            this.nodes, 
            ...Module.add(this.modules, Server.create())
        )
    }

}

//// Exports ////

export default App

export { App }