import { first, wrap } from '@benzed/array'
import { isArray } from '@benzed/is'

import { FeathersService } from '@feathersjs/feathers'
import { MongoDBAdapterOptions } from '@feathersjs/mongodb'

import { 
    MongoDBAdapterParams, 
    MongoDBApplication, 
    MongoDBService 
} from '@benzed/feathers'

import { AuthenticationService } from '../authentication'
import { FileData, File, FileQuery } from './schema'

/*** Types ***/

interface FileParams extends MongoDBAdapterParams<FileQuery> { 

    user?: { _id: string } 

}

interface FileServiceSettings extends MongoDBAdapterOptions {

    auth: FeathersService<MongoDBApplication, AuthenticationService>

}

interface SignedFile extends File {

    urls: {
        uploadParts: string[]
        complete: string
        local: boolean
    }

}

/*** Main ***/

class FileService extends MongoDBService<File, FileData, FileParams> {

    private readonly _auth: FileServiceSettings['auth']

    public constructor({ auth, ...settings }: FileServiceSettings) {
        super(settings)
        this._auth = auth
    }

    public override async create( data: FileData, params?: FileParams ): Promise<SignedFile>
    public override async create( data: FileData[], params?: FileParams ): Promise<SignedFile[]>
    public override async create( 
        data: FileData | FileData[], 
        params?: FileParams
    ): Promise<SignedFile | SignedFile[]> {

        const results: SignedFile[] = []

        for (const datum of wrap(data)) {
            
            const file = await super.create(datum, params)

            // Add Shit here
            const urls = {
                uploadParts: [],
                complete: '',
                local: true
            }

            results.push({
                ...file,
                urls
            })
        }

        return isArray(data) ? first(results) ?? [] : results
    }

}

/*** Exports ***/

export default FileService

export {
    FileService,
    FileParams
}