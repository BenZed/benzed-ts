import { GetCommand } from '@benzed/app'
import fs from '@benzed/fs'
import path from 'path'

//// Main ////

class ServeUI extends GetCommand<void, string> {

    private _html = ''

    async onExecute(): Promise<string> {

        if (!this._html || process.env.NODE_ENV === 'development') {

            const PUBLIC_DIR = path.resolve(__dirname, '../../public/index.html')
            const TEMPLATE_DIR = path.resolve(__dirname, '../client/index.html')

            const HTML_DIR = await fs.exists(PUBLIC_DIR) 
                ? PUBLIC_DIR 
                : TEMPLATE_DIR

            this._html = await fs.readFile(HTML_DIR, 'utf-8')
        }

        return this._html
    }

    override get path(): string {
        return ''
    }

}

//// Exports ////

export { ServeUI }