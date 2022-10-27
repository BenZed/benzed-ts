import { Connection } from './connection'

/*** App ***/

class App {

    private _connection: Connection | null = null

    static create(): App {
        return new App()
    }

    private constructor() { /**/ }

    /**
     * The connection type of this App. Null if it 
     * has not yet been started.
     */
    get type(): 'server' | 'client' | null {
        return this._connection?.type ?? null
    }

    async start(
        connection: Connection
    ): Promise<void> {

        if (this._connection) {
            throw new Error(
                `${App.name} has already been started as a ${this._connection.type}`
            )
        }

        this._connection = connection
        await this._connection.start()
    }

    async stop(): Promise<void> {

        if (!this._connection) {
            throw new Error(
                `${App.name} has not yet been started`
            )
        }

        const connection = this._connection
        this._connection = null 
        await connection.stop()
    }

}

/*** Export ***/

export default App 

export {
    App
}