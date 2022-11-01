import path from 'path'

import fs from '@benzed/fs'
import is from '@benzed/is'
import { descending } from '@benzed/array'
import { equals } from '@benzed/immutable'
import { MongoDBApplication } from '@benzed/feathers'

import { FeathersService } from '@feathersjs/feathers'
import { FeathersKoaContext } from '@feathersjs/koa'
import { BadRequest } from '@feathersjs/errors'

import { File, FilePayload } from '../schema'
import { FileService, eachFilePart } from '../service'
import { OK_STATUS_CODE, PART_DIR_NAME } from '../constants'

import { 
    createFileRoutingMiddleware, 
    getCtxFileService, 
    getCtxPayload, 
    throwInvalidPayload,
    validatePayload 
} from './util'

//// Helper ////

function readRequestBody(ctx: FeathersKoaContext): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        
        let result = ``

        ctx.req
            .on(`data`, chunk => {
                result += `${chunk}`
            })
            .once(`error`, reject)
            .once(`end`, () => resolve(result))
    })
}

async function validatePayloadComplete(
    files: FeathersService<MongoDBApplication, FileService>,
    payload: FilePayload,
): Promise<File> {

    const file = await validatePayload(files, payload)

    if (!(`complete` in payload.action))
        throwInvalidPayload()

    return file
}

async function validateUploadCompleteSignal(
    ctx: FeathersKoaContext, 
    file: File,
    partsExpected: number[]
): Promise<number[]> {
    try {

        const body = await readRequestBody(ctx)

        // body to array of part signals
        const partSignals = body.split(`,`)
        if (!is.arrayOf.string(partSignals))
            throw new Error(`Must be an array of strings`)

        // part signals to parts
        const parts: number[] = []
        for (const partSignal of partSignals) {
            const [fileId, partStr] = partSignal.split(`-`)
            if (fileId !== file._id)
                throw new Error(`Part signal id must match file id`)
            
            const part = parseInt(partStr)
            if (is.nan(part))
                throw new Error(`Part signal index invalid.`)

            parts.push(part)            
        }
        parts.sort(descending)

        // ensure parts match 
        if (!equals(parts, partsExpected))
            throw new Error(`Part signal does not match parts expected`)

        return parts

    } catch {
        throw new BadRequest(`Upload complete signal invalid.`)
    }
}

async function validateParts(
    ctx: FeathersKoaContext, 
    file: File,
    partsDirPath: string
): Promise<number[]> {

    const partsExpected = Array
        .from(eachFilePart(file), v => v.index)
        .sort(descending)

    const partsFromFs = (await fs.readDir(partsDirPath))
        .map(parseFloat)
        .sort(descending)

    if (!equals(partsFromFs, partsExpected)) {
        throw new BadRequest(
            `Upload incomplete for id '${file._id}'`
        )
    }

    await validateUploadCompleteSignal(ctx, file, partsExpected)

    return partsFromFs
}

async function validatePartsPath(
    file: File,
    localDirPath: string
): Promise<string> {

    // Get parts part
    const partDirPath = path.join(
        localDirPath, 
        file._id, 
        PART_DIR_NAME
    )

    if (!await fs.exists(partDirPath)) {
        throw new BadRequest(
            `Upload has not been started for id '${file._id}'`
        )
    }

    return partDirPath
}

async function writePartToFile(
    partPath: string,
    filePath: string
): Promise<void> {

    const partRead = fs.createReadStream(partPath)
    const fileWrite = fs.createWriteStream(filePath, { flags: `a+` })

    await new Promise((resolve, reject) => {
        partRead.pipe(fileWrite)
            .on(`finish`, resolve)
            .on(`error`, reject)
    })
}

async function mergePartsIntoFile(
    file: File,
    parts: number[],
    partsDirPath: string,
    localDirPath: string
): Promise<void> {

    //
    const filePath = path.join(
        localDirPath, 
        file._id, 
        file.name + file.ext
    )

    // write parts
    while (parts.length > 0) {
        const partPath = path.join(partsDirPath, `${parts.pop()}`)
        await writePartToFile(partPath, filePath)
    }

    // remove parts dir
    await fs.remove(partsDirPath, { recursive: true })

}

//// Main ////

const uploadCompleteMiddleware = createFileRoutingMiddleware(({ verify, path, fs: localDir }) => 
    async (ctx, toService) => {
        
        const payload = await getCtxPayload(ctx, verify)
        if (!payload) 
            return toService()

        const files = getCtxFileService(ctx, path)

        const file = await validatePayloadComplete(files, payload)
        const partsDirPath = await validatePartsPath(file, localDir)
        const parts = await validateParts(ctx, file, partsDirPath)

        await mergePartsIntoFile(file, parts, partsDirPath, localDir)

        await files.patch(file._id, { uploaded: new Date() })

        ctx.body = {
            file: file._id,
            complete: true,
            code: OK_STATUS_CODE
        }
    })

//// Exports ////

export default uploadCompleteMiddleware

export {
    uploadCompleteMiddleware
}