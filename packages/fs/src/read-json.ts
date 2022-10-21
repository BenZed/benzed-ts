import { readFile } from './export'
import { PathLike } from './types'

/*** Main ***/

async function readJson<T>(
    url: PathLike,
    assert?: (input: unknown) => asserts input is T
): Promise<T> {

    const str = await readFile(url, `utf-8`)
    const json = JSON.parse(str) as unknown

    assert?.(json)

    return json as T
}

/*** Exports ***/

export default readJson

export {
    readJson
}