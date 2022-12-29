import * as sql from "./sql";
import {GROUP_ADMIN} from "./constants";
import * as permissionTs from "./permission";
import * as crypto from "./crypto";
import * as cacheableUserPermission from "./cache/cacheable_user_permission"
import * as cacheableUsers from './cache/cacheable_users'

/**
 * Get all user profile
 * @return Array<User>
 */
export const getAllUser = async (): Promise<Array<User>> => {
    //  bind
    return cacheableUsers.getAllUsers()
}

/**
 * Get user profile from id
 * @param userId
 * @return User
 */
export const getUser = async (userId: number): Promise<User | undefined> => {
    //  bind
    return await cacheableUsers.getUser(userId)
}

/**
 * change user password
 * @param userId
 * @param password
 * @return Boolean
 */
export const changePassword = async (userId: number, password: string): Promise<void> => {
    await sql.execute(
        "UPDATE `users` SET `password`=? WHERE `id`=?",
        await crypto.hash(password),
        userId
    )
}

/**
 * delete user
 * @param userId
 */
export const deleteUser = async (userId: number): Promise<void> => {
    //  users table
    await sql.execute(
        "DELETE FROM `users` WHERE `id`=?",
        userId
    )
    //  users_permission table
    await sql.execute(
        "DELETE FROM `users_permission` WHERE `id`=?",
        userId
    )
    //  users_2fa table
    await sql.execute(
        "DELETE FROM `users_2fa` WHERE `id`=?",
        userId
    )
    //  users_2fa_recovery table
    await sql.execute(
        "DELETE FROM `users_2fa_recovery` WHERE `id`=?",
        userId
    )

    //  cache update
    await cacheableUsers.fetchUsers()
    await cacheableUserPermission.fetchUserPermissions()
}

/**
 * check if user exist
 * @param userId
 * @return boolean
 */
export const existUser = async (userId: number): Promise<boolean> => {
    //  bind
    return await cacheableUsers.existUser(userId)
}

/**
 *  check if user is admin group
 *  @param userId
 *  @return boolean
 */
export const isAdmin = async (userId: number): Promise<boolean> => {
    //  bind
    const user = await cacheableUsers.getUser(userId)
    //  check if user is admin
    return !(!user || user.group !== GROUP_ADMIN)
}

/**
 *  get all permissions id
 *  @param userId
 *  @return Array<number>
 */
export const getAllPermissionId = async (userId: number): Promise<Array<number> | null> => {
    //  bind
    return await cacheableUserPermission.getAllUserPermissions(userId)
}

/**
 *  get all permission contents
 *  @param userId
 *  @return Array<Permission> | null
 */
export const getAllPermission = async (userId: number): Promise<Array<Permission> | null> => {
    const ids = await getAllPermissionId(userId)
    if (!ids) return null

    const permissions = new Array<Permission>()
    for (const id of ids) {
        const permission = await permissionTs.get(id)
        if (!permission) continue
        permissions.push(permission)
    }

    return permissions
}

/**
 * get all permission content
 * @param userId
 * @return Array<PermissionContent> | null
 */
export const getAllPermissionContents = async (userId: number): Promise<Array<PermissionContent> | null> => {
    const permissions = await getAllPermission(userId)
    if (!permissions) return null

    let contents = new Array<PermissionContent>()
    for (const permission of permissions) {
        permission.content.forEach(value => contents.push(value))
    }
    return contents
}

/**
 * add permission
 * @param userId
 * @param permissionId
 */
export const addPermission = async (userId: number, permissionId: number): Promise<void> => {
    await cacheableUserPermission.addPermission(userId, permissionId)
}

/**
 * remove permission
 * @param userId
 * @param permissionId
 */
export const removePermission = async (userId: number, permissionId: number): Promise<void> => {
    //  bind
    await cacheableUserPermission.removePermission(userId, permissionId)
}

/**
 * check if user has permission
 *
 * @param userId
 * @param permissionId
 * @return boolean
 */
export const hasPermission = async (userId: number, permissionId: number): Promise<boolean> => {
    //  bind
    return await cacheableUserPermission.hasPermission(userId, permissionId)
}

/**
 * check if user has permission content
 *
 * @param userId
 * @param permissionContent
 * @return boolean if user has return true
 */
export const hasPermissionContent = async (userId: number, permissionContent: PermissionContent): Promise<boolean> => {
    const contents = await getAllPermissionContents(userId)
    if (!contents) return false

    return contents.some((content) => {
        //  project
        if (content.project !== "*" && content.project !== permissionContent.project) {
            return false
        }
        //  service
        return content.service === "*" || content.service === permissionContent.service
    })
}

export const setGroup = async (userId: number, group: string): Promise<void> => {
    if (!userId || !group) return
    await sql.execute(
        "UPDATE `users` SET `group`=? WHERE `id`=?",
        group,
        userId
    )

    //  cache update
    await cacheableUsers.fetchUsers()
}
