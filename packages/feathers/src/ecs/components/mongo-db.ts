import { milliseconds } from "@benzed/async"
import $, { Infer } from "@benzed/schema"

import { Collection, MongoClient } from "mongodb"

import FeathersBuildComponent from "../component"
import { LifeCycleMethod, ToBuildEffect } from "../types"
import ProviderComponent, { ProviderExtend } from "./provider"

import { App } from "../../types"
import { $port } from "../../schemas"

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Constants ***/

const DEFAULT_MONGODB_PORT = 27017

/*** Schema ***/

interface MongoDbConfig extends Infer<typeof $mongoDbConfig> {}
const $mongoDbConfig = $.shape({

    uri: $.string,
    database: $.string,

    port: $port.default(DEFAULT_MONGODB_PORT),

    user: $.string.optional,
    password: $.string.optional,
})

/*** Types ***/

interface MongoDbEffectConfig {
    db: MongoDbConfig
}

interface MongoDbEffectExtends {
    client: Promise<MongoClient> | MongoClient | null
    db(collection: string): Promise<Collection>
}

type MongoDbBuildEffect = ToBuildEffect<{
    extends: MongoDbEffectExtends
    config: MongoDbEffectConfig
}>

/*** Main ***/

/**
 * Adds logging and start/stop methods for 
 */
class MongoDb extends FeathersBuildComponent<MongoDbBuildEffect> {

    protected _onValidateComponents(): void {
        this._assertRequired(ProviderComponent)
        this._assertSingle()
    }   

    protected _onConfig: LifeCycleMethod = (app) => {

        const { setup, teardown } = app

        app.setup = async function mongoDbSetup(
            this: App & MongoDbEffectExtends & ProviderExtend & MongoDbEffectConfig
        ): Promise<App> {

            const config = this.get(`db`)

            const uri = config.uri
                .replaceAll(`<port>`, config.port.toString())
                .replaceAll(`<user>`, config.user ?? ``)
                .replaceAll(`<password>`, config.password ?? ``)
                .replaceAll(`<database>`, config.database)
    
            this.client = MongoClient.connect(uri)
            this.client = await this.client

            if (`log` in this)
                (this as any).log`mongodb connected ${{ uri }}`
    
            return setup.call(this, this.server)
        }
    
        app.teardown = async function mongoDbTeardown(
            this: App & MongoDbEffectExtends & ProviderExtend
        ): Promise<App> {
    
            if (this.client) {
                this.client = await this.client
                await this.client.close()
                this.client = null
            }
            return teardown.call(this, this.server)
        }

    }

    protected _createBuildEffect(): MongoDbBuildEffect {

        const db = async function db(
            this: App & MongoDbEffectExtends, 
            collection: string
        ): Promise<Collection> {

            while (this.client === null)
                await milliseconds(250)
    
            return (await this.client)
                .db(this.get(`db`).database)
                .collection(collection)
        }

        // Compose

        return {
            config: {
                db: $mongoDbConfig
            },
            extends: {
                db,
                client: null
            }
        }
    }
}

/*** Exports ***/

export default MongoDb 

export {
    MongoDb,

    MongoDbConfig,
    $mongoDbConfig
}