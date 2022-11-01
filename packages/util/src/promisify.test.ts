import { promisify } from './promisify'

describe('Promisify', () => {

    it('wraps callback pattern methods as promises', async () => {

        const oldUglyWait = (
            time: number,
            callback: (e: Error | null, value: number) => void
        ): void => {
            setTimeout(() => callback(null, time), time)
        }

        const newSexyWait = promisify(oldUglyWait)

        const time = 100

        const output = await newSexyWait(time)

        expect(output).toEqual(time)

    })

    it('properly rejects errors', async () => {

        const ohNoYouFuckedUp = (
            input: 'throw' | 'dont-throw',
            callback: (e: Error | null, output: typeof input) => void
        ): void => {
            setTimeout(() => {
                if (input === 'throw')
                    callback(new Error('Oh, you fucked up.'), input)
            })
        }

        const ohNo = promisify(ohNoYouFuckedUp)

        try {
            await ohNo('throw')
        } catch (e) {
            expect((e as Error).message).toEqual('Oh, you fucked up.')
        }

        expect.assertions(1)
    })
})