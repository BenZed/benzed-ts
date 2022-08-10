import { Renderer, RendererOptions } from '@benzed/renderer'
import {
    Params,
    Service,
    IdType,
    Paginated
} from '@benzed/feathers'

import {
    File,
    FileCreateData,
    FilePatchData
} from './schema'

/* eslint-disable @typescript-eslint/indent, require-await */

interface FileServiceOptions {

    /**
     * Options for the preview renderer
     */
    render?: RendererOptions

    /**
     * Directory on the local file system to store files.
     */
    fs?: null | string

    /**
     * Configuration for storing files on s3
     */
    s3?: null | {
        bucket: string
        accessKeyId: string
        secretAccessKey: string
    }
}

/*** Main ***/

export default class FileService<I extends IdType, P = Params>
    implements Service<File<I>, FilePatchData, P> {

    private readonly _renderer: Renderer
    private readonly _options: FileServiceOptions

    public constructor (options?: FileServiceOptions) {

        this._renderer = new Renderer(options?.render)
        this._options = {
            ...options
        }
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
            _id: 0,
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
    public find(params?: P): Promise<Paginated<File<I>>> {
        throw new Error('Method not implemented.')
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
    FileServiceOptions
}