import Renderer from '@benzed/renderer'
import {
    Params,
    Service,
    IdType,
    Paginated
} from '@benzed/feathers/src/types'

import {
    File,
    FileCreateData,
    FilePatchData
} from './schema'

/* eslint-disable @typescript-eslint/indent */

interface FileServiceOptions {

    /**
     * Directory on the local file system to store files.
     */
    fs?: string
}

/*** Main ***/

export default
    class FileService<I extends IdType, P = Params>
    implements Service<I, FileCreateData, FilePatchData, File<I>> {
    //

    private readonly _renderer = new Renderer()

    public constructor (options: FileServiceOptions) {
        //
    }

    public async find(params?: P): Promise<Paginated<File<I>>> {
        return {
            data: [],
            total: 0,
            limit: 0,
            skip: 0
        }
    }

    public async get(id: I, params?: P): Promise<File<I>> {
        return {
            _id: id,
            name: '',
            size: 0,
            type: '',
            url: '',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    }

    public async create(data: FileCreateData, params?: P): Promise<File<I>> {
        return {
            _id: id,
            name: '',
            size: 0,
            type: '',
            url: '',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    }

    public async patch(id: I, data: FilePatchData, params?: P): Promise<File<I>> {
        return {
            _id: id,
            name: '',
            size: 0,
            type: '',
            url: '',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    }

    public async remove(id: I, params?: P): Promise<File<I>> {
        return {
            _id: id,
            name: '',
            size: 0,
            type: '',
            url: '',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    }

    // setup?(app: Application, path: string): Promise<void>

    // teardown?(app: Application, path: string): Promise<void>

}

export {
    FileService,
    FileServiceOptions,
}