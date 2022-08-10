// @ts-nocheck 

import fs from 'fs'
import mime from 'mime'
import { Request, RequestHandler } from 'express'

import { getS3Package, S3Package } from '../s3'
import { isFsConfig } from './upload-file'
import { File } from '../schema'

import is from '@benzed/is'
import { Application, ObjectId } from '@benzed/feathers'

/*** Data ***/

const ONE_HOUR = 60 * 60 // seconds
const ONE_YEAR = ONE_HOUR * 24 * 365 // seconds

const PARTIAL_STATUS_CODE = 206
const DEFAULT_MIME_TYPE = 'application/octet-stream'

/*** Types ***/

type Range = {
    start: number
    end: number
    size: number
}

/*** Helper ***/

function removeInvalidChars(input: string): string {
    let output = ''

    const FRIENDLY = /[A-z0-9]|-| |_|'|\?|!|\.|~/

    for (const char of input) {
        if (FRIENDLY.test(char))
            output += char
    }

    return output
}

function getDispositionHeader(
    query: Request['query'],
    file: File<ObjectId>,
): `${'attachment' | 'inline'}; filename="${string}"` {

    const { download, name: queryName } = query

    const disposition = download === 'true' || download === '1'
        ? 'attachment'
        : 'inline'
    const filename = removeInvalidChars(is.string(queryName) && queryName.length > 0
        ? queryName
        : file.name)

    return `${disposition}; filename="${filename}${file.ext}"`
}

function getTypeHeader(ext: string): string {
    return mime.lookup(ext) || DEFAULT_MIME_TYPE
}

function parseRange(str: string | undefined, size: number): Range | undefined {

    let [start, end] = is.string(str) // eslint-disable-line prefer-const
        ? str.replace(/bytes=/, '')
            .split('-')
            .map(word => parseInt(word, 10))
        : []

    if (!isFinite(start))
        return undefined

    if (!isFinite(end))
        end = size - 1

    if (start === 0 && end === size - 1)
        return undefined

    return { start, end, size }
}

/*** Middleware ***/

function serveS3(app: Application, { s3, bucket }: S3Package): RequestHandler {

    return async (req, res, next) => {

        const { id } = req.params

        try {

            const file: File<ObjectId> = await app.service('files').get(id)

            const range = parseRange(req.headers.range, file.size)

            const url = s3.getSignedUrl('getObject', {
                Bucket: bucket,
                Key: id,
                Range: range,
                Expires: ONE_HOUR,
                ResponseContentType: getTypeHeader(file.ext),
                ResponseContentDisposition: getDispositionHeader(req.query, file)
            })

            res.redirect(302, url)

        } catch (err) {
            return next(err)
        }
    }
}

function serveFs(app: Application): RequestHandler {

    const uploadFolder = app.get('fs')
    if (!isFsConfig(uploadFolder))
        throw new Error('Could not create file system reader. Check your "fs" configurations.')

    return async function (req, res, next) {

        const { id } = req.params

        try {

            const file: File<ObjectId> = await app.service('files').get(id)

            const { size, ext, _id } = file
            const range = parseRange(req.headers.range, size)
            if (range) {
                const { start, end } = range
                const chunk = end - start + 1

                res.status(PARTIAL_STATUS_CODE)
                res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`)
                res.setHeader('Accept-Ranges', 'bytes')
                res.setHeader('Content-Length', chunk)

            } else
                res.setHeader('Content-Length', size)

            res.setHeader('Content-Disposition', getDispositionHeader(req.query, file))
            res.setHeader('Content-Type', getTypeHeader(ext))

            res.setHeader('Cache-Control', `public, max-age=${ONE_YEAR}`)

            fs.createReadStream(`${uploadFolder}/${_id}`, range).pipe(res)

        } catch (err) {
            return next(err)
        }
    }
}

function serveFileMiddleware(app: Application): RequestHandler {
    const s3 = getS3Package(app)
    return s3
        ? serveS3(app, s3)
        : serveFs(app)
}

/*** Exports ***/

export default serveFileMiddleware

export {
    serveFileMiddleware
}