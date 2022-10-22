import { Pipe } from './components'

it('chains the output of other components', () => {
    const pipe = Pipe.create((i: number) => i * 2)
})