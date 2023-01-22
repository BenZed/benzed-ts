import { Infer } from '@benzed/util'
import { Validator } from '../validator'
import { Schema } from './schema'

const isOneToFour = new Schema(
    Validator.create({
        options: [1,2,3,4],
        is(input: unknown): input is number {
            return this.options.includes(input)
        } 
    })
)

interface OneToFour extends Infer<typeof isOneToFour> {
    // options(input: number[]): this
}
const $oneToFour: OneToFour = isOneToFour

it('dynamic update properties from validator', () => {

    const $oneToFive = $oneToFour
        .options([1,2,3,4,5])
        .error('Must be one to five')
        
})