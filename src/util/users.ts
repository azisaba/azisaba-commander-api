import * as sql from "./sql";
import {GROUP_ADMIN} from "./constants";
import {getPermission} from "./permission";

/**
 * Get all user profile
 * @return Array<User>
 */
export const getAllUser = async (): Promise<Array<User>> => {
    return await sql.findAll('SELECT `id`, `username`, `group` FROM `users`');
}

/**
 * Get user profile from id
 * @param id
 * @return User
 */
export const getUser = async (id: number): Promise<User | null> => {
    return await sql.findOne('SELECT `id`, `username`, `group` FROM `users` WHERE `id`=?', id)
}

/**
 *  check if user is admin group
 *  @param id
 *  @return boolean
 */
export const isAdmin = async (id: number): Promise<boolean> => {
    const user = await getUser(id)
    return !(!user || user.group !== GROUP_ADMIN)
}

/**
 *  get all permissions id
 *  @param userId
 *  @return Array<number>
 */
export const getAllUserPermissionId = async (userId: number): Promise<Array<number> | null> => {
    const list = await sql.findAll('SELECT `permission_id` FROM `users_permission` WHERE `user_id`=?', userId)
    if (typeof list !== 'object') return null
    return list.map(r => r.permission_id)
}

/**
 *  get all permission contents
 *
 */
export const getAllUserPermission = async (userId: number): Promise<Array<Permission> | null> => {
    const ids = await getAllUserPermissionId(userId)
    if (!ids) return null

    const permissions = new Array<Permission>()
    for (const id of ids) {
        const permission = await getPermission(id)
        if (!permission) continue
        permissions.push(permission)
    }

    return permissions
}
