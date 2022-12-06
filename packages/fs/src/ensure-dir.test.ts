import path from 'path'

import { ensureDir } from './ensure-dir'
import { exists } from './exists'
import { remove, writeFile } from './export'

const ROOT = './test-dir'

const DEEP = path.join(ROOT, '/deep/directory/tree')
const TXT = path.join(ROOT, 'hello-world.txt')

const results: boolean[] = []

beforeAll(async () => {

    if (await exists(ROOT))
        await remove(ROOT, { recursive: true })

    results.push(
        await ensureDir(DEEP),
        await ensureDir(DEEP)
    )

    await writeFile(TXT, 'hello world')
})

it('ensures a directory exists', async () => {
    expect(await exists(DEEP)).toBe(true)
})  

it('returns true if folders needed to be made', () => {
    expect(results[0]).toBe(true)
})

it('returns false if folders did not need to be made', () => {
    expect(results[1]).toBe(false)
})

it('throws if trying to overwrite a file', () => {
    return expect(ensureDir(TXT)).rejects.toThrow('Cannot ensure directory')
})