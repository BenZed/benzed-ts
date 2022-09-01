import { $, Infer } from './schema'

const AddressSchema = $({
    street: $.string(),
    apartment: $.string().optional(),
    country: $.string(),
    code: $({
        prefix: $.number(),
        postfix: $.number(),
        payload: $.string().optional()
    }).readonly()
})

type Address = Infer<typeof AddressSchema>

const VectorSchema = $({
    x: $.number(),
    y: $.number(),
    z: $.number()
        .optional()
})
type Vector = Infer<typeof VectorSchema>