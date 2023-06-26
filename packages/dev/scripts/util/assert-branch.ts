import { command } from './command'

//// Command ////

export async function assertBranch(target: string): Promise<void> {
    const branch = (await command('git', ['rev-parse', '--abbrev-ref', 'HEAD'])).trim()
    if (branch !== target)
        throw new Error(`current branch "${branch}" is not "${target}"`)
}
