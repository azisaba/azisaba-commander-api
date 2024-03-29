import { createClient } from 'redis';
import * as cacheablePermission from './cache/cacheable_permission'
import * as cacheableUserPermission from './cache/cacheable_user_permission'
import * as cacheableUsers from './cache/cacheable_users'
import * as cacheableTwoFA from './2fa'

const debug = require('debug')('azisaba-commander-api:util:redis_controller')

const channel_name = "azisaba-commander-api"
type Method = "USERS" | "PERMISSIONS" | "USER_PERMISSIONS" | "2FA"


export const init = async () => {
    debug("initializing Redis client...")

    if (!process.env.REDIS_HOST) {
        debug("Skip this action.")
        return
    }

    const redisClient = createClient({
        socket: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT ?? '6379'),
        },
        username: process.env.REDIS_USER ?? undefined,
        password: process.env.REDIS_PASSWORD ?? undefined
    })

    const subscriber = redisClient.duplicate();
    //  connect
    await subscriber.connect();
    await subscriber.subscribe(channel_name, async (message) => {
        debug("subscribe message: ", message)
        switch (message) {
            case "USERS":
                await cacheableUsers.fetchUsers(true)
                break
            case "PERMISSIONS":
                await cacheablePermission.fetchPermissions(true)
                break
            case "USER_PERMISSIONS":
                await cacheableUserPermission.fetchUserPermissions(true)
                break
            case "2FA":
                await cacheableTwoFA.fetchTwoFAUsers(true)
                break
        }
    })
    subscriber.on('error', function(err) {
        console.log('redis_err ' + String(err));
    });

    debug("Created redis client")
}

export const requestUpdate = async (method: Method) => {
    if (!process.env.REDIS_HOST) {
        return
    }

    const redisClient = createClient({
        socket: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT ?? '6379'),
        },
        username: process.env.REDIS_USER ?? undefined,
        password: process.env.REDIS_PASSWORD ?? undefined
    })

    const publisher = redisClient.duplicate();
    //  connect
    await publisher.connect();

    await publisher.publish(channel_name, method);
    debug("Publish message: ", method)

    await publisher.disconnect()
}