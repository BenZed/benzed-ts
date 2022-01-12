import { Json } from '@benzed/util'
import { PathLike, writeFile } from './overrides'

/*** Types ***/

type StringifyParams = Parameters<typeof JSON.stringify>

type Replacer = Exclude<StringifyParams[1], undefined>
type Spaces = Exclude<StringifyParams[2], undefined>

/*** Main ***/

async function writeJson<T extends Json>(
    input: T,
    url: PathLike,
    replacer?: Replacer,
    spaces?: Spaces
): Promise<void> {

    const str = JSON.stringify(input, replacer, spaces)

    await writeFile(url, str, 'utf-8')
}

/*** Exports ***/

export default writeJson

export {
    writeJson
}