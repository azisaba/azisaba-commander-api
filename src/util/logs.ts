import * as sql from "./sql";

export const commit = async (userId: number, message: string): Promise<void> => {
    await sql.execute(
        "INSERT INTO `logs` (`user_id`, `message`) VALUES (?, ?)",
        userId,
        message
    )
}

/*
export const get = async (option?: LogGetterOption): Promise<Array<string>> => {
    if (!option) {

    } else {

    }
}
*/
