import { PathLike, readFile } from './overrides'

/*** Main ***/

async function readJson<T>(
    url: PathLike,
    validate?: (input: unknown) => asserts input is T
): Promise<T> {

    const str = await readFile(url, 'utf-8')
    const json = JSON.parse(str) as unknown

    validate?.(json)

    return json as T
}

/*** Exports ***/

export default readJson

export {
    readJson
}