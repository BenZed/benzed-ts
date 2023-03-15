import { GetCommand } from '@benzed/app'
import fs from '@benzed/fs'

//// Main ////

class ServeUI extends GetCommand<void, string> {

    private _html = ''

    async execute(): Promise<string> {

        if (!this._html)
            this._html = await fs.readFile('../client/index.html', 'utf-8')

        return this._html
    }

    override get path(): string {
        return ''
    }

}

//// Exports ////

export { ServeUI }