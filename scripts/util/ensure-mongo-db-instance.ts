import fs from 'fs'
import os from 'os'
import path from 'path'

import {
    spawn,
    exec,
    ChildProcessWithoutNullStreams
} from 'child_process'

//// Constants ////

const IS_WIN = os.platform() === 'win32'

const CWD = process.cwd()

const ROOT_DIR_NAME = 'benzed-ts'

const ROOT_DIR = __dirname.substring(0, __dirname.indexOf(ROOT_DIR_NAME) + ROOT_DIR_NAME.length)
if (!ROOT_DIR.includes(ROOT_DIR_NAME) || !fs.existsSync(ROOT_DIR))
    throw new Error(`Could not find ${ROOT_DIR_NAME} directory.`)

const SHX = path.relative(
    CWD,
    path.resolve(ROOT_DIR, 'node_modules/.bin/shx')
)
if (!fs.existsSync(SHX))
    throw new Error(`${__filename} could not find shx command`)

const DEFAULT_MONGO_DB_PORT = 27017
const PROTECTED_CLUSTERS = ['production'] // in case a local machine is used to run production
const MONGO_CMD = IS_WIN
    ? 'C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe'
    : 'mongod'

const KILL_MONGO_CMD = IS_WIN
    ? 'TASKKILL /F /IM mongod.exe'
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

const toVoid = (): void => undefined 

function execute(cmd: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(cmd, { cwd: CWD }, (err, output) => {
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

async function killMongoProcess(): Promise<void> {

    if (mongoProcess) {
        await new Promise(resolve => {
            
            mongoProcess?.stdout.destroy()
            mongoProcess?.stdin.destroy()
            mongoProcess?.kill('SIGTERM')
            mongoProcess?.once('close', resolve)
            mongoProcess?.once('error', resolve)
        
            mongoProcess = null
        })

        // ensure there is no mongodb process started elsewhere
    } else {
        await execute(KILL_MONGO_CMD)
            .catch(e => {
                if (e.message.includes('Access denied'))
                    return Promise.reject(e)
            })
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

    const log = options.log
        ? console.log.bind(console)
        : toVoid

    log(`Ensuring mongodb ${options.isRunning
        ? `is running ${options.clean ? 'clean ' : ''}` + `on port ${options.port} for cluster "${options.cluster}"`
        : 'is not running'}`)

    if (isMongoProcessInCorrectState(options))
        return

    // if we've gotten here, the process needs to shut down either way.
    // either it's suppost to be shut down, or it needs to be started 
    // with different args.
    if (mongoProcess)
        log('Shutting down existing mongo process')

    await killMongoProcess()

    if (!options.isRunning)
        return

    await untilPortFree(options.port)

    const { clean, cluster, port } = options

    if (clean && PROTECTED_CLUSTERS.includes(cluster))
        throw new Error(`Cannot clean protected cluster "${cluster}"`)

    if (clean) {
        log(`Removing existing "${cluster}" cluster data.`)
        await execute(`${SHX} rm -rf ./storage/${cluster}`).catch(toVoid)
    }

    await execute(`${SHX} mkdir ./storage`).catch(toVoid)
    await execute(`${SHX} mkdir ./storage/${cluster}`).catch(toVoid)
    await execute(`${SHX} mkdir ./storage/${cluster}/db`).catch(toVoid)
    await execute(`${SHX} mkdir ./storage/${cluster}/files`).catch(toVoid)

    log(`Starting mongodb "${cluster}" cluster on port ${port}`)

    await new Promise<void>((resolve, reject) => {

        mongoProcess = spawn(MONGO_CMD, [
            '--dbpath', path.join(CWD, 'storage', cluster, 'db'),
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
                        log(`Process: ${msg}`)

                    if (msg.includes('Waiting for connections'))
                        resolve()

                    if (msg.includes('Now exiting') || msg.includes('Fatal assertion'))
                        reject(new Error('MongoDb could not start.'))
                }

            } catch (e) {
                if (options.log === 'process')
                    log(`Process error: ${jsonStr}`)
            }
        })
    })
}

//// Exports ////

export default ensureMongoDbInstance

export {
    ensureMongoDbInstance
}