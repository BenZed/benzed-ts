
import { Client, ClientSettings, Command, Server, ServerSettings } from './app-modules'
import Service from './service'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Types ////

type Services = {
    [key: string]: Service | Command<any,any,any>
}

//// Main ////

class App<M extends [Client] | [Server] | [], S extends Services> extends Service<M,S> {

    static override create<Sx extends Services>(services: Sx): App<[],Sx> {
        return new App(services)
    }

    get services(): S {
        return this.nodes
    }

    asClient(settings: ClientSettings): App<[Client], S> {
        return new App(
            this.nodes, 
            Client.create(settings)
        )
    }

    asServer(settings: ServerSettings): App<[Server], S> {
        return new App(
            this.nodes, 
            Server.create(settings)
        )
    }
}

//// Exports ////

export default App

export { App }