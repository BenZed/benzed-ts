import { $, Infer } from './index'

const AddressSchema = $({
    street: $.string(),
    apartment: $.string().optional(),
    country: $.string(),
    code: $({
        prefix: $.number(),
        postfix: $.number(),
        payload: $.string().optional()
    }).mutable().optional(),
    switch: $.boolean()
})

const VectorSchema = $({
    x: $.number().mutable(),
    y: $.number().mutable(),
    z: $.number().mutable().optional()
})

const EdgeSchema = $(VectorSchema, VectorSchema)

const RangeSchema = $.tuple($.number(), $.number())

const TeamSchema = $({
    status: $($.boolean(), $.string()),
    traffic: $($.boolean(), 'red', 'green'),
    keys: $.record($.string())
})

const VectorTeamSchema = $.and(
    VectorSchema,
    TeamSchema
)

const CompositeSchema = $({
    vt: VectorTeamSchema.optional(),
    range: RangeSchema.mutable(),
    edge: EdgeSchema,
    address: AddressSchema.optional()
})

type Composite = Infer<typeof CompositeSchema>