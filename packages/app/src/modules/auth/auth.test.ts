import $ from '@benzed/schema/lib'
import { io } from '@benzed/util/lib'
import { Auth } from './auth'

it('is sealed', () => {

    // @ts-expect-error Sealed
    void class extends Auth {}
})

it('static .create()', () => {
    const auth = Auth.create({})
    expect(auth).toBeInstanceOf(Auth)
})

it('creates access tokens', async () => {

    const auth = Auth.create({})

    const token = await auth.createAccessToken({ foo: 'bar' })

    expect(typeof token).toEqual('string')
    expect(token.length).toBeGreaterThan(0)
})

it('verifies access tokens', async () => {

    const auth = Auth.create({})

    const payload = { foo: 'Cake' }

    const token = await auth.createAccessToken(payload)
    const obj = await auth.verifyAccessToken(token)

    expect(obj).toEqual(payload)

})

it('optional verfication validator', async () => {

    const auth = Auth.create({})

    const payloadIn1 = { email: 'name@email.com', password: 'password' }
    const payloadSchema = $({
        email: $.string.format('email'),
        password: $.string.length('>=', 8)
    })
    const token1 = await auth.createAccessToken(payloadIn1)

    //
    const payloadOut1 = await auth.verifyAccessToken(token1, payloadSchema)
    expect(payloadOut1).toEqual(payloadIn1)

    // 
    const token2 = await auth.createAccessToken({ badPayload: true })
    const token2Error = await auth.verifyAccessToken(token2, payloadSchema.assert).catch(io)

    expect(token2Error).toHaveProperty('name', 'ValidationError')
})