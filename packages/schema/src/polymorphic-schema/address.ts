import { $, Infer } from './index'

const AddressSchema = $({
    street: $.string(),
    apartment: $.string().optional(),
    country: $.string(),
    code: $({
        prefix: $.number(),
        postfix: $.number(),
        payload: $.string().optional()
    }).readonly().optional()
})

type Address = Infer<typeof AddressSchema>

const VectorSchema = $({
    x: $.number(),
    y: $.number(),
    z: $.number().optional()
})

type Vector = Infer<typeof VectorSchema>
