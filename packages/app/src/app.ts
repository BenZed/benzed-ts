
import { Client, Server } from './app-modules'
import Service from './service'

//// Types ////

type Services = {
    [key: string]: Service
}

//// Main ////

class App<M extends [Client] | [Server] | [], S extends Services> extends Service<M,S> {

    static override create<Sx extends Services>(services: Sx): App<[],Sx> {
        return new App(services)
    }

    get services(): S {
        return this.nodes
    }

    asClient(): App<[Client], S> {
        return new App(
            this.nodes, 
            Client.create()
        )
    }

    asServer(): App<[Server], S> {
        return new App(
            this.nodes, 
            Server.create()
        )
    }

}

//// Exports ////

export default App

export { App }