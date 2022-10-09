import path from 'path'

import fs from '@benzed/fs'
import { MongoDBApplication } from '@benzed/feathers'

import { FeathersService } from '@feathersjs/feathers'
import { FeathersKoaContext } from '@feathersjs/koa'

import { FilePayload } from '../schema'
import FileService from '../service'
import { throwInvalidPayload, validatePayload } from './upload-complete'
import { PART_DIR_NAME } from '../constants'
/*** Helper ***/

function writePart(
    ctx: FeathersKoaContext, 
    partDir: string,
    part: number
): Promise<void> {
    return new Promise((resolve, reject) => {

        const partFile = path.join(partDir, part.toString())

        const partWriteStream = fs.createWriteStream(partFile)

        ctx.req.pipe(partWriteStream)
            .once('error', reject)
            .once('finish', resolve)
    })
}

async function validatePayloadPart(
    files: FeathersService<MongoDBApplication, FileService>,
    payload: FilePayload
): Promise<number> {

    await validatePayload(files, payload)

    if (!('part' in payload.action))
        throwInvalidPayload()

    const { part } = payload.action
    return part
}

async function ensurePartDir(
    fileId: string,
    localDir: string
): Promise<string> {
    const fileDir = path.join(localDir, fileId)
    const partDir = path.join(fileDir, PART_DIR_NAME)

    await fs.ensureDir(partDir)

    return partDir
}

/*** Main ***/

async function uploadPart(
    ctx: FeathersKoaContext, 
    files: FeathersService<MongoDBApplication, FileService>,
    payload: FilePayload,
    localDir: string
): Promise<void> {

    const part = await validatePayloadPart(files, payload)
    const partDir = await ensurePartDir(payload.file, localDir)

    await writePart(ctx, partDir, part)

    ctx.response.set({ 
        Etag: `${payload.file}-${part}` 
    })

    ctx.body = {
        file: payload.file,
        part,
        code: 200
    }

}

/*** Exports ***/

export default uploadPart

export {
    uploadPart
}