import { is } from '@benzed/is'
import $, { Infer } from '@benzed/schema'
import { Empty, fromBase64, omit, toBase64 } from '@benzed/util'

import jwt, { JwtPayload } from 'jsonwebtoken'

import { CommandModule } from '../../command'

import type { RecordCollection } from '../database'
import type { Request } from '../../command/request'
import type { HttpMethod } from '../../util'

//// Helper ////

const Put = 1 as unknown as HttpMethod.Put

// Generates a new secret every day.
const randomSecret = (() => {

    const random = Math.random() * 10000000

    return () => {

        const date = new Date()
        date.setHours(0)
        date.setMinutes(0)
        date.setSeconds(0)
        date.setMilliseconds(0)

        return (date.getTime() + random)
            .toString()
            .replaceAll('.', '')
    }

})()

//// Settings ////

interface AuthSettings extends Infer<typeof $authSettings> {}
const $authSettings = $({
    secret: $.string.optional.default(randomSecret),
    collection: $.string.optional.default('users')
})

type AssertPayload<T extends object> = 
    | ((input: object) => asserts input is T)
    | { assert: (input: object) => asserts input is T }

//// Module ////

class Auth extends CommandModule<'authenticate', { email: string, password: string }, { accessToken: string }> {

    static create(settings: AuthSettings = {}): Auth {
        return new Auth(
            $authSettings.validate(settings) as Required<AuthSettings>
        )
    }

    private constructor(
        readonly settings: Required<AuthSettings>
    ) {
        super('authenticate')
    }

    protected override get _copyParams(): unknown[] {
        return [this.settings]
    }

    //// State ////
    
    /**
     * Access token if authenticated on the client
     */
    get accessToken(): string | null {
        return this._accessToken
    }
    private _accessToken: string | null = null // TODO serialize this

    //// Module Interface ////

    override _validateModules(): void {
        this._assertSingle()
    }

    get collection(): RecordCollection<{ password: string }> {

        throw new Error('Not yet implemented')
        // const database = this.getModule(Database, true)

        // const collection = database.getCollection<{ password: string }>(settings.collection)
        // return collection
    }
    
    //// Command Module Implementation ////

    async _execute(
        credentials: { email: string, password: string }
    ): Promise<{ accessToken: string }> {

        const records = await this.collection.find({ email: credentials.email } as { /**/ })

        const entity = records
            .records
            .find(r => this._comparePasswords(credentials.password, r.password))
        if (!entity)
            throw new Error('Invalid credentials')

        const accessToken = await this.createAccessToken({ _id: entity._id, })
        return { accessToken }
    }

    override async execute(input: { email: string, password: string }): Promise<{ accessToken: string }> {
        const { accessToken } = await super.execute(input)

        if (this.parent?.root.client)
            this._accessToken = accessToken

        return { accessToken }
    }

    fromRequest([method, url, _, headers]: Request<object>): { email: string, password: string } | null {
        if (method !== Put)
            return null

        if (url !== `/${this.name}`)
            return null

        const auth = headers?.get('authorization')
        if (!auth)
            return null 

        const [email, password] = fromBase64(auth).split(':') 
        if (!is.string(email) || !is.string(password))
            return null
            
        return { email, password }
    }

    toRequest(input: { email: string, password: string }): Request<Empty> {

        const headers = new Headers()

        const { email, password } = input

        const credentials = toBase64(`${email}:${password}`)

        headers.set('authorization', `Basic ${credentials}`)

        return [
            Put,
            `/${this.name}`,
            {},
            headers
        ]
    }

    get methods(): HttpMethod[] {
        return [Put]
    }

    //// Token Interface ////

    async createAccessToken(payload: object): Promise<string> {

        const { secret } = this.settings

        const token = await new Promise<string>((resolve, reject) => {
            jwt.sign(
                payload, 
                secret, 
                (error, token) => error 
                    ? reject(error) 
                    : resolve(token as string))
        })

        return token
    }

    async verifyAccessToken<T extends object>(
        token: string, 
        validatePayload?: AssertPayload<T>
    ): Promise<T> {

        const { secret } = this.settings
        
        // Verify
        const payload = await new Promise<JwtPayload>((resolve, reject) => 
            jwt.verify(
                token, 
                secret, 
                (error, payload) => error 
                    ? reject(error) 
                    : resolve(payload as JwtPayload)
            )
        )

        // Validate
        if (validatePayload) {

            const validator = typeof validatePayload === 'function' 
                ? { assert: validatePayload } 
                : validatePayload

            void validator.assert(payload)
        }

        return omit(payload, 'iat') as T // remove jwt fields added to the payload 
    }

    //// Util ////

    private _comparePasswords(a: string, b: string): boolean {
        // TODO hash these
        return a === b
    }
}

//// Exports ////

export default Auth

export {
    Auth
}