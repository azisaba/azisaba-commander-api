import express from "express"
import crypto from 'crypto'
import * as sql from "./sql";
import {GROUP_ADMIN} from "./constants";

//  session cache
const sessions: SessionTable = {}

export const generateSecureRandomString = (lengthDividedBy2: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(lengthDividedBy2, function(err, buffer) {
            if (err) {
                reject(err)
            } else {
                resolve(buffer.toString('hex'))
            }
        });
    })
}

export const sleep = async (time: number): Promise<void> => {
    await new Promise((res) => setTimeout(res, time));
}

export const getIP = (req: express.Request) => {
    const cf = req.headers['cf-connecting-ip']
    if (cf) return cf as string
    return req.ip
}

export const putSession = async (session: Session): Promise<Session> => {
    //  insert
    await sql.execute(
        'INSERT INTO `sessions` (`state`, `expires_at`, `user_id`, `ip`, `pending`) VALUES (?, ?, ?, ?, ?)',
        session.state,
        session.expires_at,
        session.user_id,
        session.ip,
        session.pending
        )
    //  cache
    sessions[session.state] = {
        ...session,
        expires_at: Math.min(session.expires_at, Date.now() + 1000 * 60 * 60 * 12)
    }
    return sessions[session.state]
}

/**
 * Get session
 * @param state
 * @param cache
 */
export const getSession = async (state: string, cache: boolean = true): Promise<Session | null> => {
    const cached = sessions[state]
    if (!cache || !cached || cached.expires_at < Date.now()) {
        if (cached?.expires_at > Date.now() && cached?.ip === '' && cached?.pending === SessionStatus.PENDING && cached?.user_id === 0) return null
        const session = await sql.findOne('SELECT * FROM `sessions` WHERE `state`=?', state)
        if (!session) {
            sessions[state] = {
                state,
                expires_at: Date.now() + 1000 * 60 * 60,
                ip: '',
                pending: SessionStatus.PENDING,
                user_id: 0,
            }
        } else {
            sessions[state] = {
                ...session,
                expires_at: Math.min(session.expires_at, Date.now() + 1000 * 60 * 60 * 12),
            }
        }
    }
    return sessions[state]
}

/**
 * delete session
 * @param state
 */
export const deleteSession = async (state: string): Promise<void> => {
    await sql.execute('DELETE FROM `sessions` WHERE `state`=?', state)
    //  remove cache
    delete sessions[state]
}

/**
 * verify new user that need to review by admin
 * @param state
 * @return Session | null
 */
export const verifyUnfinishedSession = async (state: string): Promise<Session | null> => {
    const session = await getSession(state, false)
    if (!session) return null
    //  if session had been approved
    if (session.pending !== SessionStatus.UNDER_REVIEW) return session

    //  update session
    await deleteSession(state)
    await putSession({
        ...session,
        pending: SessionStatus.AUTHORIZED
    })

    return await getSession(state, false)
}

/**
 * Get session key with request
 * @param request
 * @return state
 */
export const getSessionKey = (request: express.Request): string | null => {
    let key: string | null = null
    if (request.cookies) key = request.cookies['azisabacommander_session']
    if (!key && request.body) key = request.body['azisabacommander_session']
    if (!key && request.headers) key = request.headers['x-azisabacommander-session']?.toString() || null

    return key
}

/**
 * get session and validate it
 * Thanks PerfectBoat for provide this code
 * @param req
 * @return session | null
 */
export const validateAndGetSession = async (req: express.Request): Promise<Session | null> => {
    const session = getSessionKey(req)
    if (!session) return null
    const token = await getSession(session)
    // reject if:
    // - no session
    // - expired session
    // - pending registration
    if (!session || !token || token.pending !== SessionStatus.AUTHORIZED || token.expires_at <= Date.now()) return null
    if (token.ip !== getIP(req)) return null // reject if ip address does not match
    return token
}

/**
 * Get all user profile
 * @return Array<User>
 */
export const getAllUser = async (): Promise<Array<User>> => {
    return await sql.findAll('SELECT `id`, `username`, `group` FROM `users`')
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
    return !(!user || user.group !== GROUP_ADMIN);
}

/*
export const getUserPermission = async (id: number): Promise<Array<Permission>> => {
    return await sql
}
*/