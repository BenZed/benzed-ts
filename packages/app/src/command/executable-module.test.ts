import { ExecutableModule } from './executable-module'

it('callable module', () => {
    const executable = new ExecutableModule((x: { foo: string }) => ({ ...x, count: 0 }))

    expect(executable({ foo: 'string' })).toEqual({ foo: 'string', count: 0 })
})