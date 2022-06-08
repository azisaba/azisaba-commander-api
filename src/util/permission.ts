import * as sql from "./sql"

export const getPermission = async (id: number): Promise<Permission | null> => {
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