import * as sql from "./sql";
import {GROUP_ADMIN} from "./constants";
import * as permissionTs from "./permission";
import * as crypto from "./crypto";

/**
 * Get all user profile
 * @return Array<User>
 */
export const getAllUser = async (): Promise<Array<User>> => {
    return await sql.findAll('SELECT `id`, `username`, `group` FROM `users`');
}

/**
 * Get user profile from id
 * @param userId
 * @return User
 */
export const getUser = async (userId: number): Promise<User | null> => {
    return await sql.findOne('SELECT `id`, `username`, `group` FROM `users` WHERE `id`=?', userId)
}

/**
 * change user password
 * @param userId
 * @param password
 * @return Boolean
 */
export const changePassword = async (userId: number, password: string): Promise<void> => {
    return await sql.execute(
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
}

/**
 * check if user exist
 * @param userId
 * @return boolean
 */
export const existUser = async (userId: number): Promise<Boolean> => {
    if (!userId) return false
    return !await sql.findOne(
        "SELECT `id` FROM `users` WHERE `id`=?",
        userId
    )
}

/**
 *  check if user is admin group
 *  @param userId
 *  @return boolean
 */
export const isAdmin = async (userId: number): Promise<boolean> => {
    const user = await getUser(userId)
    return !(!user || user.group !== GROUP_ADMIN)
}

/**
 *  get all permissions id
 *  @param userId
 *  @return Array<number>
 */
export const getAllPermissionId = async (userId: number): Promise<Array<number> | null> => {
    const list = await sql.findAll('SELECT `permission_id` FROM `users_permission` WHERE `user_id`=?', userId)
    if (typeof list !== 'object') return null
    return list.map(r => r.permission_id)
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
        contents.concat(permission.content)
    }
    return contents
}

/**
 * add permission
 * @param userId
 * @param permissionId
 */
export const addPermission = async (userId: number, permissionId: number): Promise<void> => {
    await sql.execute(
        "INSERT INTO `users_permission` (`user_id`, `permission_id`) VALUES (?, ?)",
        userId,
        permissionId
    )
}

/**
 * remove permission
 * @param userId
 * @param permissionId
 */
export const removePermission = async (userId: number, permissionId: number): Promise<void> => {
    await sql.execute(
        "DELETE FROM `users_permission` WHERE `user_id`=? AND `permission_id`=?",
        userId,
        permissionId
    )
}

/**
 * check if user has permission
 *
 * @param userId
 * @param permissionId
 * @return boolean
 */
export const hasPermission = async (userId: number, permissionId: number) => {
    if (!userId || !permissionId) return false
    return !await sql.findOne(
        "SELECT `id` FROM `users_permission` WHERE `user_id`=? AND `permission_id`=?",
        userId,
        permissionId
    )
}

/**
 * check if user has permission content
 *
 * @param userId
 * @param permissionContent
 * @return boolean if user has return true
 */
export const hasPermissionContent = async (userId: number, permissionContent: PermissionContent): Promise<Boolean> => {
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
