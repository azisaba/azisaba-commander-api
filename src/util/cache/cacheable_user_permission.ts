import * as sql from "../sql"
import {requestUpdate} from "../redis_controller";

type UserPermissionMap = {
    [userId: number]: Array<number>
}

const userPermissionMap: UserPermissionMap = {}

/**
 * Initialize cacheable user permission provider
 *
 * @param interval [ms] default: 5 min
 */
export const init = async (interval: number = 5*60*1000): Promise<void> => {
    await fetchUserPermissions(true)

    //  start handler
    setInterval(
        async () => {
            await fetchUserPermissions(true)
        },
        interval
    )
}

/**
 * Fetch all user permissions
 *
 * @return UserPermissionMap|undefined
 */
export const fetchUserPermissions = async (fromRedis: boolean = false): Promise<UserPermissionMap | undefined> => {
    const userList = await sql.findAll('SELECT `id` FROM `users`');
    //  if not find, return null
    if (!userList || typeof userList !== 'object') return undefined

    for (const user of userList) {
        const userId = user.id as number

        //  get all user permission
        const permissionList = await sql.findAll('SELECT `permission_id` FROM `users_permission` WHERE `user_id`=?', userId)
        if (!permissionList || typeof permissionList !== 'object') {
            continue
        }

        if (userPermissionMap[userId]) {
            userPermissionMap[userId].splice(0)
        }

        userPermissionMap[userId] = permissionList.map(r => r.permission_id)
    }

    if (!fromRedis) {
        //  redis
        await requestUpdate("USER_PERMISSIONS")
    }

    return userPermissionMap
}

/**
 * Get all user permissions from cache data.
 * it's able to fetch permission from db optionally.
 *
 * @param userId
 * @param fetch if you want to fetch from db, turn it
 */
export const getAllUserPermissions = async (userId: number, fetch: boolean = false): Promise<Array<number>> => {
    if (fetch) {
        await fetchUserPermissions()
    }
    return userPermissionMap[userId]
}

/**
 * Check if user has specific permission.
 * it's able to fetch permission from db optionally.
 *
 * @param userId
 * @param permissionId
 * @param fetch if you want to fetch from db, turn it
 */
export const hasPermission = async (userId: number, permissionId: number, fetch: boolean = false): Promise<boolean> => {
    //  null check
    if (!userId || !permissionId) return false
    //  fetch
    if (fetch) {
        await fetchUserPermissions()
    }

    //  get permission list
    const permissions = await getAllUserPermissions(userId)
    //  search same value
    return permissions.some(value => value == permissionId)
}

/**
 * Remove permission from user.
 * is will be reflected immediately.
 *
 * @param userId
 * @param permissionId
 */
export const removePermission = async (userId: number, permissionId: number): Promise<void> => {
    //  delete from sql
    await sql.execute(
        "DELETE FROM `users_permission` WHERE `user_id`=? AND `permission_id`=?",
        userId,
        permissionId
    )

    await fetchUserPermissions()
}

/**
 * Add permission to user.
 * is will be reflected immediately.
 *
 * @param userId
 * @param permissionId
 */
export const addPermission = async (userId: number, permissionId: number): Promise<void> => {
    await sql.execute(
        "INSERT INTO `users_permission` (`user_id`, `permission_id`) VALUES (?, ?)",
        userId,
        permissionId
    )

    await fetchUserPermissions()
}
