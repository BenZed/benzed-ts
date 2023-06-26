import { ChildProcessWithoutNullStreams, spawn } from 'child_process'

import path from 'path'
import fs from 'fs/promises'
import os from 'os'

import { command } from './command'

//// Constants ////

const IS_WIN = os.platform().startsWith('win')

const DEFAULT_MONGO_DB_PORT = 27017

const PROTECTED_CLUSTERS = ['production'] // in case a local machine is used to run production

const MONGO_PROGRAM = IS_WIN
    ? 'C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe'
    : 'mongod'

//// Types ////

type EnsureMongoDbOptions = ({

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

let mongoProcess: ChildProcessWithoutNullStreams| null = null
const spawnArgs: readonly string[] = []

//// Helper ////

const toVoid = (): void => undefined 

function isMongoProcessInCorrectState(options: Required<EnsureMongoDbOptions>): boolean {

    if (!options.isRunning)
        return !mongoProcess

    if (!mongoProcess)
        return false

    if (options.clean)
        return false

    const clusterArg = spawnArgs[1]
        ?.replace(/^\.\/storage\//, '')
        .replace(/\/db$/, '')

    const portArg = parseInt(spawnArgs[3])
    return options.cluster === clusterArg && options.port === portArg
}

function makeDir(path: string): Promise<void> {
    return fs.mkdir(path).catch(toVoid)
}

function removeDir(path: string): Promise<void> {
    return fs.rm(path, { recursive: true, force: true }).catch(toVoid)
}

function defaultifyOptions(options: EnsureMongoDbOptions): Required<EnsureMongoDbOptions> {

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

        const [cmd, ...args] = IS_WIN
            ? ['TASKKILL', '/F', '/IM', 'mongod.exe']
            : ['killall', MONGO_PROGRAM]
    
        await command(cmd, args)
            .catch(e => {
                if (e.message.includes('Access denied'))
                    return Promise.reject(e)
            })
    }
}

async function isPortFree(port: number): Promise<boolean> {
    try {

        const args = IS_WIN
            ? ['-a', '-p', 'udp | find', `":${port}"`]
            : ['-a', '-p', 'udp | grep', `".${port}"`]
        
        await command(
            'netstat', 
            args
        )
        return false
    } catch (e){
        return true
    }
}

async function untilPortFree(port: number): Promise<void> {
    let portFree = false
    while (!portFree)
        portFree = await isPortFree(port)
}

//// Main ////

async function ensureMongoDb(input: EnsureMongoDbOptions): Promise<void> {
    
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
        log(`Removing mongodb "${cluster}" cluster existing data.`)
        await removeDir(`./storage/${cluster}`)
    }

    await makeDir('./storage')
    await makeDir(`./storage/${cluster}`)
    await makeDir(`./storage/${cluster}/files`)
    await makeDir(`./storage/${cluster}/db`)

    log(`Starting mongodb "${cluster}" cluster`)

    await new Promise<void>((resolve, reject) => {

        mongoProcess = spawn(
            MONGO_PROGRAM, [
                '--dbpath', 
                path.join(process.cwd(), 'storage', cluster, 'db'),

                '--port', 
                port.toString()
            ]
        )

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

    log(`Started mongodb "${cluster}" cluster on port ${port}`)

}

//// Exports ////

export default ensureMongoDb

export {
    ensureMongoDb,
    EnsureMongoDbOptions
}