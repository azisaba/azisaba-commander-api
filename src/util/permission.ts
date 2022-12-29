import * as cacheablePermission from './cache/cacheable_permission'

/**
 * Get a permission info
 *
 * @param id
 * @return Permission
 */
export const get = async (id: number): Promise<Permission | undefined> => {
    // bind
    return await cacheablePermission.getPermission(id)
}

/**
 * Get all permission info
 *
 * @return Array<Permission>
 */
export const getAll = async (): Promise<Array<Permission>> => {
    //  bind
    return await cacheablePermission.getAllPermissions()
}

export const remove = async (id: number): Promise<void> => {
    //  bind
    await cacheablePermission.removePermission(id)
}

export const create = async (permission: Permission): Promise<number | undefined> => {
    //  bind
    return await cacheablePermission.createPermission(permission)
}

export const update = async (permission: Permission): Promise<void> => {
    //  bind
    await cacheablePermission.updatePermission(permission)
}

export const exist = async (id: number): Promise<boolean> => {
    return await cacheablePermission.existPermission(id)
}