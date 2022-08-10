// @ts-nocheck 

import fs from 'fs'
import path from 'path'
import { Request, RequestHandler, ErrorRequestHandler } from 'express'

import multer, { diskStorage, StorageEngine } from 'multer'
import s3Storage from 'multer-s3'

import type { Application as ExpressApp } from '@feathersjs/express'

import is from '@benzed/is'

import { getS3Package } from '../s3'

/*** Types ***/

function isFsConfig(fsConfig: unknown): fsConfig is string {
    if (!is.string(fsConfig))
        return false

    try {
        const fsStat = fs.statSync(fsConfig)
        return fsStat.isDirectory()
    } catch {
        return false
    }
}

/*** Helper ***/

function createS3Storage(app: ExpressApp<GearsServiceTypes, GearsSettings>): StorageEngine | null {

    const s3Data = getS3Package(app)
    if (!s3Data)
        return null

    const { s3, bucket } = s3Data

    return s3Storage({
        s3,
        bucket,
        key(req: Request, _file, done) {
            const id = getReqFileRecordID(req)
            done(null, id.toString())
        }
    })
}

function createFsStorage(app: ExpressApp<GearsServiceTypes, GearsSettings>): StorageEngine | null {

    const fsConfig = app.get('fs')
    if (!isFsConfig(fsConfig))
        return null

    return diskStorage({
        destination: fsConfig,
        filename(req, _file, done) {
            const id = getReqFileRecordID(req)
            done(null, id.toString())
        }
    })
}

function createUploadMiddleware(app: ExpressApp<GearsServiceTypes, GearsSettings>): RequestHandler {

    const storage = createS3Storage(app) ?? createFsStorage(app)
    if (!storage)
        throw new Error('Could not create file storage. Check your "s3" or "fs" configurations.')

    const upload = multer({ storage }).single('file')

    return (req, res, next) => {
        setReqFileRecordID(req, new ObjectId())
        upload(req, res, next)
    }
}

const getReqFileRecordID = (req: Request) => {
    const id = (req as any)._id
    if (!is(id, ObjectId))
        throw new Error('RecordID not in request.')

    return id
}

/*** Req Getters ***/

const setReqFileRecordID = (req: Request, id: ObjectId) => {
    (req as any)._id = id
}

const setReqUserRecord = (req: Request, user: UserRecordServer) => {
    (req as any).user = user
}

const getReqUserRecord = (req: Request): UserRecordServer => {
    const user = (req as any).user
    if (!user || !is(user._id, ObjectId))
        throw new Error('User not in request.')

    return user
}

/*** uploadFile ***/

function uploadFileMiddleware(app: ExpressApp<GearsServiceTypes, GearsSettings>): void {

    const authenticate: RequestHandler = async (req, _res, next) => {
        const accessToken = req.headers.authorization

        try {
            const { user } = await app.service('authentication').create({
                strategy: 'jwt',
                accessToken
            })

            setReqUserRecord(req, user)
            next()
        } catch (err) {
            next(err)
        }
    }

    const uploadFile = createUploadMiddleware(app)

    const createFileRecord: RequestHandler = async (req, res, next) => {

        const file = req.file
        if (!file)
            return next()

        const { size } = file
        const ext = path.extname(file.originalname)
        const name = path.basename(file.originalname, ext)

        const user = getReqUserRecord(req)

        const fileRecordData: Partial<FileRecordServer> = {
            _id: getReqFileRecordID(req),
            name,
            ext,
            size,
            uploader: user._id
        }

        log`${user.email} files upload "${file.originalname}"`

        try {
            const fileRecord = await app.service('files').create(fileRecordData)
            res.send(fileRecord)
        } catch (err) {
            next(err)
        }
    }

    const cleanupOnError: ErrorRequestHandler = async (error, _req, _res, next) => {
        // TODO: remove any partial files/extraneous file records, etc

        next(error)
    }

    app.post(
        '/upload',
        authenticate,
        uploadFile,
        createFileRecord,
        cleanupOnError
    )

}

/*** Exports ***/

export default uploadFileMiddleware

export {
    uploadFileMiddleware,

    isFsConfig
}