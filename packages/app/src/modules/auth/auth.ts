import { is } from '@benzed/is'
import $, { Infer, SchemaFor } from '@benzed/schema'
import { fromBase64, nil, omit, toBase64 } from '@benzed/util'

import jwt, { JwtPayload } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

import { HttpCode, HttpMethod, RequestHandler } from '../../util'
import { MongoDb, MongoDbCollection } from '../mongo-db'

import { CommandModule } from '../command/command-v2'
import { CommandError } from '../command'

//// Helper ////

const DEFAULT_SECRET = 'default-secret-do-not-use-in-production'
const DEFAULT_PASSWORD_SALT_ROUNDS = 10

//// Settings ////

interface AuthSettings extends Infer<typeof $authSettings> {}
const $authSettings = $({
    secret: $.string.optional.default(DEFAULT_SECRET),
    collection: $.string.optional.default('users'),
    saltRounds: $.number.optional.default(DEFAULT_PASSWORD_SALT_ROUNDS)
})

//// Types ////

type AssertPayload<T extends object> = 
    | ((input: object) => asserts input is T)
    | { assert: (input: object) => asserts input is T }

interface Credentials {
    readonly email: string 
    readonly password: string
}

const $credentials: SchemaFor<Credentials> = $({
    email: $.string,
    password: $.string
})

interface AccessToken {
    accessToken: string
}

//// Handler ////

const authRequestHandler = RequestHandler
    .create(HttpMethod.Put, $credentials)
    .addHeaderLink(
        (head, { email, password, ...rest }) => {
            const credentials = toBase64(`${email}:${password}`)
            head.set('authorization', `Basic ${credentials}`)
            return rest
        },
        (headers, data) => {

            const auth = headers?.get('authorization')
            if (!auth)
                return nil 
    
            const [email, password] = fromBase64(auth.replace('Basic ', ''))
                .split(':') 
            
            if (!is.string(email) || !is.string(password))
                return nil

            return { ...data, email, password }
        }
    )

//// Module ////

class Auth extends CommandModule<'authenticate', Credentials, Promise<AccessToken>> {

    static create(settings: AuthSettings = {}): Auth {
        return new Auth(
            $authSettings.validate({ ...settings }) as Required<AuthSettings>
        )
    }

    private constructor(readonly settings: Required<AuthSettings>) {
        const name = 'authenticate'
        super(
            name,
            authRequestHandler.setUrl(`/${name}`)
        )
    }

    protected override get _copyParams(): unknown[] {
        return [this.settings]
    }

    //// State ////
    
    /**
     * Access token if authenticated on the client
     */
    get accessToken(): string {
        return this._accessToken ?? ''
    }
    private _accessToken: string | nil = nil // TODO serialize this

    //// Module Interface ////

    override _validateModules(): void {
        this._assertSingle()
    }

    get collection(): MongoDbCollection<Credentials> {
        type C = typeof this.settings.collection

        const database = this
            .findModule<MongoDb<{ [K in C]: MongoDbCollection<Credentials> }>, true>(MongoDb, true)

        const collection = database.getCollection(this.settings.collection)
        return collection
    }
    
    //// Command Module Implementation ////

    protected async _executeOnServer(
        credentials: Credentials
    ): Promise<AccessToken> {

        const password = await this.hashPassword(credentials.password)

        const { records } = await this.collection.find({ email: credentials.email })

        const [ entity ] = records
        if (!entity || await bcrypt.compare(password, entity.password))
            throw new CommandError(HttpCode.Unauthorized, 'Invalid credentials.')

        const accessToken = await this.createAccessToken({ _id: entity._id, })
        return { accessToken }
    }

    protected override async _executeOnClient(
        credentials: Credentials
    ): Promise<AccessToken> {
        const { accessToken } = await super._executeOnClient(credentials)

        if (this.parent?.root.client)
            this._accessToken = accessToken

        return { accessToken }
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

    hashPassword(password: string): Promise<string> {
        const { saltRounds } = this.settings
        return bcrypt.hash(password, saltRounds)
    }
}

//// Exports ////

export default Auth

export {
    Auth,
    Credentials as AuthCredentials,
    AccessToken
}