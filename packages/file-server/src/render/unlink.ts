import fs from 'fs'

/*** Main ***/

function unlink(url: string): Promise<void> {
    return new Promise<void>(resolve =>
        fs.unlink(url, () => resolve())
    )
}

/*** Exports ***/

export default unlink

export {
    unlink
}