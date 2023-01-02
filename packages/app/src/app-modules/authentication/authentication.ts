import { Module } from '@benzed/ecs'
import $, { Infer } from '@benzed/schema'
import { nil, omit } from '@benzed/util'

import jwt, { JwtPayload } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

import { MongoDbCollection } from '../mongo-db'
import { AppModule } from '../../app-module'
import { HttpCode } from '../../util'
import { CommandError } from '../command'

import { authenticate, AuthenticateCommand, Credentials } from './authenticate'
import Service from '../../service'

/* eslint-disable 
    @typescript-eslint/ban-types
*/

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

interface AccessToken {
    accessToken: string
}

//// Module ////

class Authentication extends AppModule<AuthSettings> {

    static create(settings: AuthSettings = {}): Authentication {
        return new Authentication(
            $authSettings.validate({ ...settings }) as Required<AuthSettings>
        )
    }

    //// State ////

    get settings(): Required<AuthSettings> {
        return this.data as Required<AuthSettings>
    }
    
    /**
     * Access token if authenticated on the client
     */
    get accessToken(): string {
        return this._accessToken ?? ''
    }
    private readonly _accessToken: string | nil = nil // TODO serialize this

    //// Module Interface ////

    override validate(): void {
        Module.assert.isSingle(this)
    }

    get collection(): MongoDbCollection<string, Credentials> {

        const collection = this
            .node
            .assertModule
            .inAncestors((m): m is MongoDbCollection<string, Credentials> => 
                m instanceof MongoDbCollection && 
                m.name === this.settings.collection
            )

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

    createCommand(): Service<[AuthenticateCommand],{}> {
        return Service.create(authenticate)
    }
}

//// Exports ////

export default Authentication

export {
    Authentication,
    AccessToken,
}