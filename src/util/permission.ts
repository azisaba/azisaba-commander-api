import * as sql from "./sql"

/**
 * Get a permission info
 *
 * @param id
 * @return Permission
 */
export const get = async (id: number): Promise<Permission | null> => {
    if (isNaN(id)) {
        return null
    }
    const p = await sql.findOne(
        "SELECT * FROM `permissions` WHERE `id`=?",
        id
    )
    //  if not find, return null
    if (!p) return null

    return {
        id: p.id,
        name: p.name,
        content: parseContent(p.content)
    }
}

/**
 * Get all permission info
 *
 * @return Array<Permission>
 */
export const getAll = async (): Promise<Array<Permission> | null> => {
    const p = await sql.findAll(
        "SELECT * FROM `permissions`"
    )
    //  if not find, return null
    if (!p || typeof p !== 'object') return null

    const permissions = new Array<Permission>()
    for (let permission of p) {
        //  parse
        permission.content = parseContent(permission.content)

        permissions.push(permission)
    }

    return permissions
}

export const remove = async (id: number): Promise<void> => {
    //  delete from sql
    await sql.execute(
        "DELETE FROM `permissions` WHERE `id`=?",
        id
    )
    return
}

export const create = async (permission: Permission): Promise<number | null> => {
    //  format content
    const contentStr = formatContent(permission.content)

    //  sql
    const id = await sql.findOne(
        "INSERT INTO `permissions` (`name`, `content`) VALUES (?, ?)",
        permission.name,
        contentStr
    ) as number

    if (!id) return null
    return id
}

export const update = async (permission: Permission): Promise<void> => {
    //  format content
    const contentStr = formatContent(permission.content)

    return await sql.execute(
        "UPDATE `permissions` SET `name`=?, `content`=? WHERE `id`=?",
        permission.name,
        contentStr,
        permission.id
    )
}

export const exist = async (id: number): Promise<boolean> => {
    if (!id) return false
    return await sql.findOne(
        "SELECT `id` FROM `permissions` WHERE `id`=?",
        id
    ) !== null
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
    let contentsStr= ""
    for (const content of contents) {
        contentsStr += content.project + ":" + content.service + "|"
    }
    return contentsStr
}