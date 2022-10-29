import { $, Infer } from '@benzed/schema'

import { $logIcon, $port } from "../schemas"
import { Module, ModuleSetting } from "../module"

import { MongoClient } from 'mongodb'

/*** Base ***/

/**
 * Just in case I intend to add support for more databases later,
 * they should all have the same interface
 */
abstract class Database<S extends ModuleSetting> extends Module<S> {
    override validateModules(): void {
        this._assertRoot()
        this._assertSingle()
    }
}

/*** Constants ***/

const DEFAULT_MONGODB_PORT = 27017

/*** Types ***/

interface MongoDbSettings extends Infer<typeof $mongoDbSettings>{}

const $mongoDbSettings = $.shape({

    uri: $.string,
    database: $.string,

    port: $port.default(DEFAULT_MONGODB_PORT),

    user: $.string.optional,
    password: $.string.optional,

    logIcon: $logIcon.default(`🗄️`)

})

/*** MongoDb ***/

class MongoDb extends Database<Required<MongoDbSettings>> {

    static create(settings: MongoDbSettings): MongoDb {
        return new MongoDb(
            $mongoDbSettings.validate(settings) as Required<MongoDbSettings>
        )
    }

    private _mongoClient: MongoClient | null = null

    constructor(
        settings: Required<MongoDbSettings>
    ) {
        super(settings)
    }

    override async start(): Promise<void> {
        const { settings } = this

        const uri = settings.uri
            .replaceAll(`<port>`, settings.port.toString())
            .replaceAll(`<user>`, settings.user ?? ``)
            .replaceAll(`<password>`, settings.password ?? ``)
            .replaceAll(`<database>`, settings.database)

        console.log(uri)
        this._mongoClient = await MongoClient.connect(uri)

        this.log`mongodb connected ${{ uri }}`
    }

    override async stop(): Promise<void> {
        
        if (!this._mongoClient) 
            return 

        await this._mongoClient.close()

        this._mongoClient = null

        this.log`mongodb disconnected`
    }

}

/*** Exports ***/

export {
    MongoDb,
    MongoDbSettings,
    $mongoDbSettings,

    DEFAULT_MONGODB_PORT
}