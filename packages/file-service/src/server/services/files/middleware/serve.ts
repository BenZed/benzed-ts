import path from 'path'

import { MongoDBApplication } from '@benzed/feathers'
import fs from '@benzed/fs'
import { isString } from '@benzed/is'

import { FeathersService } from '@feathersjs/feathers'
import { FeathersKoaContext } from '@feathersjs/koa'
import { BadRequest } from '@feathersjs/errors'

import FileService from '../service'
import { ONE_YEAR, PARTIAL_STATUS_CODE } from '../constants'

/*** Types ***/

interface Range {
    start: number
    end: number
    size: number
}

/*** Helper ***/

function parseRange(str: string | undefined, size: number): Range | undefined {

    let [start, end] = isString(str) // eslint-disable-line prefer-const
        ? str.replace(/bytes=/, '')
            .split('-')
            .map(word => parseInt(word, 10))
        : []

    if (!isFinite(start))
        start = 0
    start = Math.max(start, 0)

    if (!isFinite(end))
        end = size - 1
    end = Math.min(end, size - 1)

    if (start === 0 && end === size - 1)
        return undefined

    return { start, end, size }
}

/*** Main ***/

async function serve(
    ctx: FeathersKoaContext,
    files: FeathersService<MongoDBApplication, FileService>,
    fileId: string,
    localDirPath: string
): Promise<void> {

    const file = await files.get(fileId)
    if (!file.uploaded)
        throw new BadRequest(`Upload is not complete for id '${fileId}'`)

    const fileName = file.name + file.ext
    const filePath = path.join(
        localDirPath, 
        file._id, 
        fileName
    )

    const range = parseRange(ctx.request.get('content-range'), file.size)
    if (range) {

        const { start, end } = range
        const chunk = end - start + 1

        ctx.status = PARTIAL_STATUS_CODE
        ctx.set('accept-ranges', 'bytes')
        ctx.set('content-range', `bytes ${start}-${end}/${file.size}`)
        ctx.set('content-length', `${chunk}`)
    } else 
        ctx.set('content-length', `${file.size}`)

    ctx.set('content-type', file.type)
    ctx.set('content-disposition', `inline; filename="${fileName}"`)
    ctx.set('cache-control', `public, max-age=${ONE_YEAR}`)

    ctx.body = fs.createReadStream(filePath, range)

}

/*** Exports ***/

export default serve

export {
    serve
}