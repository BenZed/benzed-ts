import path from 'path'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore 
import fetch from 'node-fetch'

import configuration from '@feathersjs/configuration'

import fs from '@benzed/fs'
import { min } from '@benzed/array'
import { TEST_ASSETS } from '@benzed/renderer/test-assets'

import { 
    SignedFile,
    MAX_UPLOAD_PART_SIZE, 
    PART_DIR_NAME 
} from './files-service'

import { FileServerApp, FileServerConfig } from './server/create-file-server-app'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Server ***/

export const TEST_FILE_SERVER_CONFIG = configuration()() as unknown as FileServerConfig

export const HOST = `http://localhost:${TEST_FILE_SERVER_CONFIG.port}` 

export interface UploadedAssetData {
    partEtags: string[]
    signedFile: SignedFile
    localFilePath: string
    partNames: string[]
}

export class Uploader {

    static ASSETS = {
        ...TEST_ASSETS,
        large: path.resolve(
            TEST_FILE_SERVER_CONFIG.fs as string, 
            '../large-binary-list.json'
        )
    }

    static async createLargeBinaryListFile (): Promise<void> {

        const { large } = Uploader.ASSETS

        const binaryList: { index: number, binary: string }[] = []

        let i = 0
        let size = 0
        while (size < MAX_UPLOAD_PART_SIZE * 3) {
            const binaryListItem = { 
                index: i++, 
                binary: i.toString(2) 
            }
            binaryList.push(binaryListItem)
            size += JSON.stringify(binaryListItem, null, 4).length + 16 //
        }

        await fs.appendFile(
            large,
            JSON.stringify(
                binaryList,
                null, 
                4
            )
        )
    }

    constructor(
        public server: FileServerApp
    ) {}

    createSignedFile (
        localFilePath: string,
        uploaderId: string
    ): Promise<SignedFile> {
    
        const stat = fs.sync.stat(localFilePath)
    
        return this.server.service('files').create({
            size: stat.size,
            name: path.basename(localFilePath),
            uploader: uploaderId
        })
    }

    async part (
        partUrl: string, 
        sourceFileUrl: string,
        sourceFileSize: number, 
        partIndex: number
    ): Promise<string> {

        const res = await fetch(
            HOST + partUrl,
            {
                method: 'PUT',
                body: fs.createReadStream(sourceFileUrl, { 
                    start: partIndex * MAX_UPLOAD_PART_SIZE,
                    end: min((partIndex + 1) * MAX_UPLOAD_PART_SIZE, sourceFileSize)
                })
            }
        )

        const json = await res.json()
        if (res.status >= 400)
            throw json

        return res.headers.get('etag') as string
    }

    async complete (
        completeUrl: string,
        etags: string[]
    ): Promise<{ code: number }> {

        const res = await fetch(
            HOST + completeUrl,
            {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: etags
            }
        )

        const json = await res.json()
        if (res.status >= 400)
            throw json

        return json
    }
    
    /**
     * Upload 
     */
    async parts(
        localFilePath: string,
        { urls, size }: SignedFile
    ): Promise<string[]> {

        const etags: string[] = []

        for (let i = 0; i < urls.uploadParts.length; i++) {
            const partUrl = urls.uploadParts[i]
            etags.push(
                await this.part(partUrl, localFilePath, size, i)
            ) 
        }

        return etags
    }

    /**
     * Upload all test assets to the provided server
     */
    async assets(
        uploaderId: string
    ): Promise<UploadedAssetData[]> {

        const uploadedAssetData: UploadedAssetData[] = []
    
        for (const localFilePath of Object.values(Uploader.ASSETS)) {

            const signedFile = await this.createSignedFile(localFilePath, uploaderId)

            const partEtags = await this.parts(localFilePath, signedFile).catch(e => e)

            const partNames = fs.sync.readDir(
                path.join(
                    this.server.get('fs') as string, 
                    signedFile._id, 
                    PART_DIR_NAME
                )
            )

            await this.complete(signedFile.urls.complete, partEtags)

            uploadedAssetData.push({ 
                signedFile, 
                localFilePath,
                partEtags, 
                partNames 
            })
        }

        return uploadedAssetData
    }
}