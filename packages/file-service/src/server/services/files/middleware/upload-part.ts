import { MongoDBApplication } from '@benzed/feathers'
import fs from '@benzed/fs'

import { FeathersService } from '@feathersjs/feathers'
import { FeathersKoaContext } from '@feathersjs/koa'
import { BadRequest } from '@feathersjs/errors'

import path from 'path'

import { FilePayload } from '../schema'
import FileService from '../service'
import { PART_DIR_NAME } from '../constants'

/*** Types ***/

type FeathersFileService = FeathersService<MongoDBApplication, FileService>

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
    files: FeathersFileService,
    payload: FilePayload
): Promise<number> {

    if (!('part' in payload.action))
        throw new BadRequest('Invalid payload.')

    const file = await files.get(payload.file)
    if (file.uploader !== payload.uploader)
        throw new BadRequest('Invalid payload.')

    const { part } = payload.action
    return part
}

async function ensurePartDir(
    localDir: string,
    payload: FilePayload
): Promise<string> {
    const fileDir = path.join(localDir, payload.file)
    const partDir = path.join(fileDir, PART_DIR_NAME)

    await fs.ensureDir(partDir)

    return partDir
}

/*** Main ***/

async function uploadPart(
    ctx: FeathersKoaContext, 
    files: FeathersFileService,
    payload: FilePayload,
    localDir: string
): Promise<void> {

    const part = await validatePayloadPart(files, payload)
    const partDir = await ensurePartDir(localDir, payload)

    await writePart(ctx, partDir, part)

    ctx.response.set({ Etag: `${payload.file}-${part}` })

    ctx.body = {
        file: payload.file,
        part,
        status: 200
    }

}

/*** Exports ***/

export default uploadPart

export {
    uploadPart
}