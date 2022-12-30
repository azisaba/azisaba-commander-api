import * as sql from "../sql"
import {requestUpdate} from "../redis_controller";

const permissions: Permission[] = []

/**
 * Initialize cacheable permission provider
 *
 * @param interval [ms] default: 5 min
 */
export const init = async (interval: number = 5*60*1000): Promise<void> => {
    await fetchPermissions(true)

    //  start handler
    setInterval(
        async () => {
            await fetchPermissions(true)
        },
        interval
    )
}

/**
 * Fetch all permissions
 * @return Permission[]|undefined
 */
export const fetchPermissions = async (fromRedis: boolean = false): Promise<Permission[] | undefined> => {
    const res = await sql.findAll(
        "SELECT * FROM `permissions`"
    )
    //  if not find, return null
    if (!res || typeof res !== 'object') return undefined

    permissions.splice(0)

    for (let permission of res ) {
        //  parse
        permission.content = parseContent(permission.content)

        permissions.push(permission)
    }

    if (!fromRedis) {
        //  redis
        await requestUpdate("PERMISSIONS")
    }

    return permissions
}

/**
 * Get all permissions from cache data.
 * it's able to fetch permission from db optionally.
 *
 * @param fetch if you want to fetch from db, turn it
 */
export const getAllPermissions = async (fetch: boolean = false): Promise<Permission[]> => {
    if (fetch) {
        return await fetchPermissions() ?? []
    }
    return permissions
}

/**
 * Get permission from cache data.
 * it's able to fetch permission from db optionally.
 *
 * @param id permission id
 * @param fetch if you want to fetch from db, turn it
 */
export const getPermission = async (id: number, fetch: boolean = false): Promise<Permission | undefined> => {
    if (isNaN(id)) {
        return undefined
    }

    if (fetch) {
        await fetchPermissions()
    }
    return permissions.find((value) => value.id == id)
}

/**
 * Check if permission exists in cache data.
 * it's able to fetch permission from db optionally.
 *
 * @param id permission id
 * @param fetch if you want to fetch from db, turn it
 */
export const existPermission = async (id: number, fetch: boolean = false): Promise<boolean> => {
    //  null check
    if (!id) return false
    if (fetch) {
        await fetchPermissions()
    }
    return permissions.some((value) => value.id == id)
}

/**
 * Remove permission.
 * is will be reflected immediately.
 */
export const removePermission = async (id: number): Promise<void> => {
    //  delete from sql
    await sql.execute(
        "DELETE FROM `permissions` WHERE `id`=?",
        id
    )

    await fetchPermissions()
}

/**
 * Update permission.
 * is will be reflected immediately.
 *
 * @param permission
 */
export const updatePermission = async (permission: Permission): Promise<void> => {
    //  format content
    const contentStr = formatContent(permission.content)

    //  update
    await sql.execute(
        "UPDATE `permissions` SET `name`=?, `content`=? WHERE `id`=?",
        permission.name,
        contentStr,
        permission.id
    )

    await fetchPermissions()
}

/**
 * Create permission.
 * is will be reflected immediately.
 *
 * @param permission
 */
export const createPermission = async (permission: Permission): Promise<number | undefined> => {
    //  format content
    const contentStr = formatContent(permission.content)

    //  sql
    const id = await sql.findOne(
        "INSERT INTO `permissions` (`name`, `content`) VALUES (?, ?)",
        permission.name,
        contentStr
    ) as number

    if (!id) return undefined

    //  update
    await fetchPermissions()

    return id
}

/**
 * Parse permission content
 *
 * format rule:
 * project:service|project:service|...
 *
 * @param content
 * @return Array<PermissionContent>
 */
const parseContent = (content: string): Array<PermissionContent> => {
    //  split with "|"
    let pairs = content.split("|")
    if (pairs.length <= 0) return []
    //  check incorrect format
    pairs = pairs.filter(pair => {
        const content = pair.split(":")
        return content.length === 2
    })

    return pairs.map(pair => {
        const content = pair.split(":")
        return {
            project: content[0],
            service: content[1]
        }
    })
}

/**
 * format permission content
 *
 * format rule:
 * project:service|project:service|...
 *
 * @param contents
 * @return string
 */
const formatContent = (contents: Array<PermissionContent>): string => {
    let contentsStr = ""
    for (const content of contents) {
        contentsStr += content.project + ":" + content.service + "|"
    }
    return contentsStr
}