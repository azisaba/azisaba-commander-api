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
 *
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

export const getAllPermissionContents = async (userId: number): Promise<Array<PermissionContent> | null> => {
    const permissions = await getAllPermission(userId)
    if (!permissions) return null

    let contents = new Array<PermissionContent>()
    for (const permission of permissions) {
        contents.concat(permission.content)
    }
    return contents
}

export const hasPermission = async (userId: number, permissionContent: PermissionContent): Promise<Boolean> => {
    const contents = await getAllPermissionContents(userId)
    if (!contents) return false

    return contents.some((content) => {
        //  project
        if (content.project !== "*" && content.project !== permissionContent.project) {
            return false
        }
        //  service
        if (content.service !== "*") {
            return false
        }
        //  todo 条件
    })
}
