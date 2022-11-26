import os from 'os'

import {
    spawn,
    exec,
    ChildProcessWithoutNullStreams
} from 'child_process'

import { createLogger, toNil, toVoid } from '@benzed/util'
import path from 'path'

//// Constants ////

const IS_WIN = os.platform() === 'win32'

const ROOT_DIR = process.cwd()
const DEFAULT_MONGO_DB_PORT = 27017
const PROTECTED_CLUSTERS = ['production'] // in case a local machine is used to run production
const MONGO_CMD = IS_WIN
    ? 'C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe'
    : 'mongod'

const KILL_MONGO_CMD = IS_WIN
    ? `taskkill /F /IM ${MONGO_CMD}`
    : `killall ${MONGO_CMD}`

const CHECK_PORT_CMD = IS_WIN
    ? `netstat -a -p udp | find ":${DEFAULT_MONGO_DB_PORT}"`
    : `netstat -a -p udp | grep ".${DEFAULT_MONGO_DB_PORT}"`

//// Types ////

type EnsureMongoDbInstanceOptions = ({

    isRunning: true

    /**
     * Ensure database is wiped clean on start.
     */
    clean?: boolean

    /**
     * "dev" by default.
     */
    cluster?: string

    port?: number

} | {

    isRunning: false

}) & {
    log?: boolean | 'process'
}

//// Module State ////

let mongoProcess: ChildProcessWithoutNullStreams | null = null

//// Helper ////

function execute(cmd: string): Promise<string> {

    return new Promise((resolve, reject) => {
        exec(cmd, { cwd: ROOT_DIR }, (err, output) => {
            if (err)
                reject(err)
            else
                resolve(output)
        })
    })
}

function isMongoProcessInCorrectState(options: Required<EnsureMongoDbInstanceOptions>): boolean {

    if (!options.isRunning)
        return !mongoProcess

    if (!mongoProcess)
        return false

    if (options.clean)
        return false

    const clusterArg = mongoProcess.spawnargs[1]
        ?.replace(/^\.\/storage\//, '')
        .replace(/\/db$/, '')

    const portArg = parseInt(mongoProcess.spawnargs[3])

    return options.cluster === clusterArg && options.port === portArg
}

function defaultifyOptions(
    options: EnsureMongoDbInstanceOptions
): Required<EnsureMongoDbInstanceOptions> {

    const { isRunning, log = false } = options
    if (!isRunning)
        return { isRunning, log }

    const {
        clean = false,
        cluster = 'dev',
        port = DEFAULT_MONGO_DB_PORT
    } = options

    return { isRunning: true, clean, log, cluster, port }
}

function killMongoProcess(): Promise<void> {

    if (mongoProcess) {
        return new Promise(resolve => {
            mongoProcess?.kill()
            mongoProcess?.once('close', resolve)
            mongoProcess = null
        })

        // ensure there is no mongodb process started elsewhere
    } else {
        return execute(KILL_MONGO_CMD)
            .catch(toVoid)
            .then(toVoid)
    }
}

async function isPortFree(port: number): Promise<boolean> {
    try {
        await execute(
            CHECK_PORT_CMD.replace(
                CHECK_PORT_CMD.toString(),
                port.toString()
            )
        )
        return false
    } catch {
        return true
    }
}

async function untilPortFree(port: number): Promise<void> {

    let portFree = false
    while (!portFree)
        portFree = await isPortFree(port)

}

//// Main ////

async function ensureMongoDbInstance(input: EnsureMongoDbInstanceOptions): Promise<void> {

    const options = defaultifyOptions(input)

    const log = createLogger({
        header: '💾',
        onLog: options.log
            ? console.log.bind(console)
            : (...args) => void args
    })

    log`Ensuring mongodb ${options.isRunning
        ? `is running ${options.clean ? 'clean ' : ''}` +
        `on port ${options.port} for cluster "${options.cluster}"`
        : 'is not running'}`

    if (isMongoProcessInCorrectState(options))
        return

    // if we've gotten here, the process needs to shut down either way.
    // either it's suppost to be shut down, or it needs to be started 
    // with different args.
    if (mongoProcess)
        log`Shutting down existing mongo process`

    await killMongoProcess()

    if (!options.isRunning)
        return

    await untilPortFree(options.port)

    const { clean, cluster, port } = options

    if (clean && PROTECTED_CLUSTERS.includes(cluster))
        throw new Error(`Cannot clean protected cluster "${cluster}"`)

    if (clean) {
        log`Removing existing "${cluster}" cluster data.`
        await execute(`rm -rf ./storage/${cluster}`)
    }

    await execute('shx mkdir ./storage').catch(toNil)
    await execute(`shx mkdir ./storage/${cluster}`).catch(toNil)
    await execute(`shx mkdir ./storage/${cluster}/db`).catch(toNil)
    await execute(`shx mkdir ./storage/${cluster}/files`).catch(toNil)

    log`Starting mongodb "${cluster}" cluster on port ${port}`

    await new Promise<void>((resolve, reject) => {

        mongoProcess = spawn(MONGO_CMD, [
            '--dbpath', `"${ROOT_DIR}/storage/${cluster}/db"`,
            '--port', port.toString()
        ])

        mongoProcess.stdout.on('data', (data: Buffer) => {

            const jsonStr = '[' +
                data.toString()
                    .split('\n')
                    .filter(word => word)
                    .join(',')
                + ']'

            try {

                const output = JSON.parse(jsonStr) as { msg: string }[]
                for (const { msg } of output) {
                    if (options.log === 'process')
                        log`Process: ${msg}`

                    if (msg.includes('Waiting for connections'))
                        resolve()

                    if (msg.includes('Now exiting') || msg.includes('Fatal assertion'))
                        reject(new Error('MongoDb could not start.'))
                }

            } catch (e) {
                if (options.log === 'process')
                    log`Process error: ${jsonStr}`
            }
        })
    })
}

//// Exports ////

export default ensureMongoDbInstance

export {
    ensureMongoDbInstance
}