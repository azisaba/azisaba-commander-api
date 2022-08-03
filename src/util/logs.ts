import * as sql from "./sql";

export const commit = async (userId: number, message: string): Promise<void> => {
    await sql.execute(
        "INSERT INTO `logs` (`user_id`, `message`) VALUES (?, ?)",
        userId,
        message
    )
}

/**
 * get list of logs
 * @param option[LogGetterOption]
 * @return Array<Log>
 */
export const get = async (option?: LogGetterOption): Promise<Array<Log>> => {
    let userId: number | undefined = undefined
    let limit = 100;
    if (option) {
        if (option.userId && isNaN(option.userId)) {
            userId = undefined
        }
        if (option.limit && isNaN(option.limit)) {
            option.limit = undefined
        }
        userId = option.userId
        limit = option.limit || 100
    }

    let result;
    if (userId) {
        result = await sql.findAll(
            "SELECT * FROM `logs` WHERE `user_id`=? ORDER BY `date` DESC LIMIT ?",
            userId,
            limit
        )
    } else {
        result = await sql.findAll(
            "SELECT * FROM `logs` ORDER BY `date` DESC LIMIT ?",
            limit
        )
    }

    return result.map(value => {
        return {
            userId: value.user_id,
            message: value.message,
            date: value.date
        }
    })
}
