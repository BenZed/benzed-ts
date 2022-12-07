import { spawn, SpawnOptions } from 'child_process'

export function command(cmd: string, args: readonly string[], options: SpawnOptions = {}): Promise<string> {
    return new Promise<string>((resolve, reject) => {

        const data: string[] = []

        const spawned = spawn(cmd, args, options)
            .once('exit', () => resolve(data.join('').trim()))
            .once('error', reject)
            
        spawned.stdout?.on('data', d => data.push(`${d}`))
        spawned.stderr?.on('data', d => reject(new Error(`${d}`)))
    })
}
