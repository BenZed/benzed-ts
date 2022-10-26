import { milliseconds } from "@benzed/async"

import { Collection, MongoClient } from "mongodb"

import FeathersBuildComponent from "../component"
import { LifeCycleMethod, ToBuildEffect } from "../types"
import ProviderComponent, { ProviderExtend } from "./provider"

import { $mongoDBConfig, MongoDBConfig } from '../../mongo-db-app'
import { App } from "../../types"

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

interface MongoDbComponentConfig {
    db: MongoDBConfig
}

interface MongoDbComponentExtends {
    client: Promise<MongoClient> | MongoClient | null
    db(collection: string): Promise<Collection>
}

type MongoDbComponentBuildEffect = ToBuildEffect<{
    extends: MongoDbComponentExtends
    config: MongoDbComponentConfig
}>

/*** Main ***/

/**
 * Adds logging and start/stop methods for 
 */
class MongoDb extends FeathersBuildComponent<MongoDbComponentBuildEffect> {

    protected _onValidateComponents(): void {
        this._assertRequired(ProviderComponent)
        this._assertSingle()
    }   

    protected _onConfig: LifeCycleMethod = (app) => {

        const { setup, teardown } = app

        app.setup = async function mongoDbSetup(
            this: App & MongoDbComponentExtends & ProviderExtend & MongoDbComponentConfig
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
            this: App & MongoDbComponentExtends & ProviderExtend
        ): Promise<App> {
    
            if (this.client) {
                this.client = await this.client
                await this.client.close()
                this.client = null
            }
            return teardown.call(this, this.server)
        }

    }

    protected _createBuildEffect(): MongoDbComponentBuildEffect {

        const db = async function db(
            this: App & MongoDbComponentExtends, 
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
                db: $mongoDBConfig
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
    MongoDb
}