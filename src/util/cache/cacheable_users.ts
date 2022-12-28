import * as sql from "../sql"

const users: User[] = []

/**
 * Initialize cacheable user provider
 *
 * @param interval [ms] default: 2 min
 */
export const init = async (interval: number = 2*60*1000): Promise<void> => {
    await fetchUsers()

    //  start handler
    setInterval(
        async () => {
            await fetchUsers()
        },
        interval
    )
}

/**
 * Fetch all users
 * @return User[]|undefined
 */
export const fetchUsers = async (): Promise<User[] | undefined> => {
    const res = await sql.findAll('SELECT `id`, `username`, `group` FROM `users`');

    //  if not find, return null
    if (!res || typeof res !== 'object') return undefined

    users.splice(0)

    for (const user of res ) {
        users.push(user)
    }

    return users
}

/**
 * Get all users from cache data.
 * it's able to fetch users from db optionally.
 *
 * @param fetch if you want to fetch from db, turn it
 */
export const getAllUsers = async (fetch: boolean = false): Promise<User[]> => {
    if (fetch) {
        await fetchUsers()
    }
    return users
}

/**
 * Get user from cache data.
 * it's able to fetch user from db optionally.
 *
 * @param id user id
 * @param fetch if you want to fetch from db, turn it
 */
export const getUser = async (id: number, fetch: boolean = false): Promise<User | undefined> => {
    if (isNaN(id)) {
        return undefined
    }

    if (fetch) {
        await fetchUsers()
    }
    return users.find((value) => value.id == id)
}

/**
 * Check if user exists in cache data.
 * it's able to fetch user from db optionally.
 *
 * @param id user id
 * @param fetch if you want to fetch from db, turn it
 */
export const existUser = async (id: number, fetch: boolean = false): Promise<boolean> => {
    //  null check
    if (!id) return false
    if (fetch) {
        await fetchUsers()
    }
    return users.some((value) => value.id == id)
}
