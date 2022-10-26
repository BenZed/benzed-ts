import { createLogger, Logger } from "@benzed/util"
import $ from "@benzed/schema"

import { $port } from "../../schemas"
import { App, AppEmit } from "../../types"

import { ToBuildEffect } from "../types"
import ProviderComponent from "./provider"
import FeathersBuildModule from "../module"

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

type Env = 'test' | 'development' | 'production'

interface ConvenienceConfig {
    name: string
    port: number
}

interface ConveninceExtends {
    log: Logger
    isEnv(input: Env): boolean
    env(): Env
    start(): Promise<void>
}

type ConvenienceBuildEffect = ToBuildEffect<{
    extends: ConveninceExtends
    config: ConvenienceConfig
}>

/*** Main ***/

/**
 * Adds logging and start/stop methods for 
 */
class Convenience extends FeathersBuildModule<ConvenienceBuildEffect> {

    protected _onValidateComponents(): void {
        this._assertSingle()
        this._assertRequired(ProviderComponent)
    }
    
    protected _createBuildEffect(): ConvenienceBuildEffect {

        // Setup 

        const env = (): Env => (process.env.NODE_ENV ?? `development`) as Env
       
        const isEnv = (input: Env): boolean => env() === input
       
        const log = createLogger({
            header: `⚙️`,
            timeStamp: true,
            onLog: env() === `test`
                ? () => { /* no logging in test mode */ }
                : console.log.bind(console)
        })

        const start = async function start(this: App & AppEmit & ConveninceExtends): Promise<void> {

            const name = this.get(`name`)
            const port = this.get(`port`)
            const env = this.env()
    
            await (this as any).listen(port)
            this.emit(`listen`, port, env)
            this.log`${name} listening on port ${port} in ${env} mode`
        }

        // Compose

        return {
            config: {
                name: $.string,
                port: $port
            },
            extends: {
                env,
                isEnv,
                log,
                start
            }
        }
    }
}

/*** Exports ***/

export default Convenience 

export {
    Convenience,
    ConvenienceConfig,
    ConveninceExtends
}