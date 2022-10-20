
import { isString } from '@benzed/is'
import fs from '@benzed/fs'

import { BadRequest } from '@feathersjs/errors'
import '@feathersjs/koa'

import { 
    DOWNLOAD_QUERY_PARAM, 
    ONE_YEAR, 
    PARTIAL_STATUS_CODE 
} from '../constants'

import { 
    createFileRoutingMiddleware, 
    getCtxFileService, 
    getFsFilePath 
} from './util'

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

const serveMiddleware = createFileRoutingMiddleware(({ path, fs: localDirPath }) => 
    async (ctx, toServiceRoutes) => {
   
        const fileId = ctx.query[DOWNLOAD_QUERY_PARAM]
        if (!isString(fileId))
            return toServiceRoutes()

        const files = getCtxFileService(ctx, path)
        const file = await files.get(fileId)
        if (!file.uploaded)
            throw new BadRequest(`Upload is not complete for id '${fileId}'`)

        const filePath = getFsFilePath(file, localDirPath)

        const range = parseRange(
            ctx.get('content-range'), 
            file.size
        )
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
        ctx.set('content-disposition', `inline; filename="${file.name + file.ext}"`)
        ctx.set('cache-control', `public, max-age=${ONE_YEAR}`)

        ctx.body = fs.createReadStream(filePath, range)

    })

/*** Exports ***/

export default serveMiddleware

export {
    serveMiddleware
}