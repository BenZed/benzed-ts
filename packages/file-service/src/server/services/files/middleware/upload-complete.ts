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
import { PART_DIR_NAME } from '../constants'

/*** Helper ***/

function readRequestBody(ctx: FeathersKoaContext): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        
        let result = ''

        ctx.req
            .on('data', chunk => {
                result += `${chunk}`
            })
            .once('error', reject)
            .once('end', () => resolve(result))
    })
}

function throwInvalidPayload(): never {
    throw new BadRequest('Invalid payload.')
}

async function validatePayload(
    files: FeathersService<MongoDBApplication, FileService>,
    payload: FilePayload
): Promise<File> {

    const file = await files.get(payload.file)
    if (file.uploader !== payload.uploader)
        throwInvalidPayload()

    if (file.uploaded)
        throw new BadRequest('File upload is already completed.')

    return file
}

async function validatePayloadComplete(
    files: FeathersService<MongoDBApplication, FileService>,
    payload: FilePayload,
): Promise<File> {

    const file = await validatePayload(files, payload)

    if (!('complete' in payload.action))
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
        const partSignals = body.split(',')
        if (!is.arrayOf.string(partSignals))
            throw new Error('Must be an array of strings')

        // part signals to parts
        const parts: number[] = []
        for (const partSignal of partSignals) {
            const [fileId, partStr] = partSignal.split('-')
            if (fileId !== file._id)
                throw new Error('Part signal id must match file id')
            
            const part = parseInt(partStr)
            if (is.nan(part))
                throw new Error('Part signal index invalid.')

            parts.push(part)            
        }
        parts.sort(descending)

        // ensure parts match 
        if (!equals(parts, partsExpected))
            throw new Error('Part signal does not match parts expected')

        return parts
    } catch (e) {
        console.warn(e)
        throw new BadRequest('Upload complete signal invalid.')
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

    await validateUploadCompleteSignal(ctx, file, partsExpected)

    const partsFromFs = (await fs.readDir(partsDirPath))
        .map(parseFloat)
        .sort(descending)

    if (!equals(partsFromFs, partsExpected))
        throw new BadRequest('All parts have not yet been uploaded.')

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
    if (!await fs.exists(partDirPath))   
        throw new BadRequest('No parts have been uploaded.')

    return partDirPath
}

async function writePartToFile(
    partPath: string,
    filePath: string
): Promise<void> {

    const partRead = fs.createReadStream(partPath)
    const fileWrite = fs.createWriteStream(filePath, { flags: 'a+' })

    await new Promise((resolve, reject) => {
        partRead.pipe(fileWrite)
            .on('finish', resolve)
            .on('error', reject)
    })
}

async function mergePartsIntoFile(
    file: File,
    parts: number[],
    partsDirPath: string,
    localDirPath: string
): Promise<void> {

    const filePath = path.join(localDirPath, file._id, file.name + file.ext)

    // write parts
    while (parts.length > 0) {
        const partPath = path.join(partsDirPath, `${parts.pop()}`)
        await writePartToFile(partPath, filePath)
    }

    // remove parts dir
    await fs.remove(partsDirPath, { recursive: true })
}

/*** Main ***/

async function uploadComplete(
    ctx: FeathersKoaContext, 
    files: FeathersService<MongoDBApplication, FileService>,
    payload: FilePayload,
    localDirPath: string
): Promise<void> {

    const file = await validatePayloadComplete(files, payload)

    const partsDirPath = await validatePartsPath(file, localDirPath)
    const parts = await validateParts(ctx, file, partsDirPath)

    await mergePartsIntoFile(file, parts, partsDirPath, localDirPath)
    
    ctx.body = {
        file: payload.file,
        complete: true,
        status: 200
    }

    await files.patch(file._id, { uploaded: new Date() })
}
/*** Exports ***/

export default uploadComplete

export {
    uploadComplete,
    validatePayload,
    throwInvalidPayload
}