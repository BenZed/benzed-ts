import { Modules, Node, Nodes } from '@benzed/ecs'

import { AppModule, AppModules } from './app-module'
import Service from './service'

//// Type ////

type Services = {
    [key: string]: Service<Modules, Nodes>
}

//// Main ////

class App<M extends readonly AppModule[], S extends Services> extends Node<M,S> {

    static create<Sx extends Services, Mx extends AppModules>(nodes: Sx, ...modules: Mx): App<Mx,Sx>
    static create<Sx extends Services, Mx extends AppModules>(...modules: Mx): App<Mx,Sx>
    static create(...args: unknown[]): unknown {
        return new App(...this._sortConstructorParams(args, AppModule, Service))
    }

}

//// Exports ////

export default App

export { App }