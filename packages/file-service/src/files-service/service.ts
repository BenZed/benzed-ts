
import { first, wrap } from '@benzed/array'
import { isArray, isNumber } from '@benzed/is'
import { ceil } from '@benzed/math'

import { 
    MongoDBAdapterParams, 
    MongoDBService 
} from '@benzed/feathers'

import { MongoDBAdapterOptions } from '@feathersjs/mongodb'
import { BadRequest } from '@feathersjs/errors'

import { FileData, File, FileQuery, FileServiceConfig, FilePayload } from './schema'
import { MAX_UPLOAD_PART_SIZE, UPLOAD_QUERY_PARAM } from './constants'

/*** Types ***/

interface FileParams extends MongoDBAdapterParams<FileQuery> { 

    user?: { _id: string } 

}

interface SignedFile extends File {

    urls: {
        uploadParts: string[]
        complete: string
        local: boolean
    }

}

interface FileServiceSettings extends MongoDBAdapterOptions {

    path: FileServiceConfig['path']
    sign: (payload: FilePayload) => string | Promise<string>

}

/*** Helper ***/

function* eachFilePart(
    file: File | number
): Generator<{ readonly index: number, readonly total: number }> {

    const size = isNumber(file) ? file : file.size

    const total = ceil(size / MAX_UPLOAD_PART_SIZE)

    for (let index = 0; index < total; index++) 
        yield { index, total }
}

/*** Main ***/

class FileService extends MongoDBService<File, Partial<FileData>, FileParams> {

    private readonly _path: FileServiceSettings['path']
    private readonly _sign: FileServiceSettings['sign']

    constructor({ path, sign, ...settings }: FileServiceSettings) {
        super(settings)
        this._path = path
        this._sign = sign
    }

    override async create( 
        data: Partial<FileData>, 
        params?: FileParams 
    ): Promise<SignedFile>

    override async create( 
        data: Partial<FileData>[], 
        params?: FileParams 
    ): Promise<SignedFile[]>

    override async create( 
        data: Partial<FileData> | Partial<FileData>[], 
        params?: FileParams
    ): Promise<SignedFile | SignedFile[]> {

        const signedFiles: SignedFile[] = []

        const files = wrap(
            await super._create(data, params)
        )

        for (const file of files) {
            signedFiles.push({
                ...file,
                urls: await this.createSignedUrls(file)
            })
        }

        return isArray(data) ? signedFiles : first(signedFiles) as SignedFile
    }

    async createSignedUrls(file: File): Promise<SignedFile['urls']> {
        return {
            uploadParts: await this._createUploadPartUrls(file),
            complete: await this._createUrl(file, { complete: true }),
            local: true
        }
    }

    // HELPER

    private async _createUploadPartUrls(file: File): Promise<string[]> {
        const partUrls: string[] = []

        for (const { index } of eachFilePart(file)) {
            partUrls.push(
                await this._createUrl(file, { part: index })
            )
        }

        return partUrls
    }

    private async _createUrl(file: File, action: FilePayload['action']): Promise<string> {

        if (!file.uploader)
            throw new BadRequest(`Uploader is required.`)
        
        const payload: FilePayload = {
            uploader: file.uploader,
            file: file._id,
            action
        }
        
        return `${this._path}?${UPLOAD_QUERY_PARAM}=` + await this._sign(payload)
    }

}

/*** Exports ***/

export default FileService

export {

    FileService,
    FileServiceSettings,

    SignedFile,
    FileParams,

    eachFilePart
}