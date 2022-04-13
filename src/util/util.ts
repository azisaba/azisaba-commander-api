import express from "express"
import crypto from 'crypto'
import * as sql from "./sql";
import {verifyToken} from "./totp";

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

export const getSession = async (state: string, cache: boolean = true): Promise<Session | null> => {
    const cached = sessions[state]
    if (!cache || !cached || cached.expires_at < Date.now()) {
        if (cached?.expires_at > Date.now() && cached?.ip === '' && cached?.pending && cached?.user_id === 0) return null
        const session = await sql.findOne('SELECT * FROM `sessions` WHERE `state`=?', state)
        if (!session) {
            sessions[state] = {
                state,
                expires_at: Date.now() + 1000 * 60 * 60,
                ip: '',
                pending: true,
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

export const deleteSession = async (state: string): Promise<void> => {
    await sql.execute('DELETE FROM `sessions` WHERE `state`=?', state)
    //  remove cache
    delete sessions[state]
}

export const approveSession = async (state: string): Promise<Session | null> => {
    const session = await getSession(state, false)
    if (!session) return null
    //  if session had been approved
    if (!session.pending) return session

    //  update session
    await sql.query(
        'UPDATE `sessions` SET `pending`=? WHERE `state`=?',
        false,
        state
    )
    return await getSession(state, false)
}

export const verify2FAToken = async (userId: number, token: string, notFoundIsFalse = false) : Promise<boolean> => {
    const secret = await sql.findOne('SELECT `secret_key` FROM `users_2fa` WHERE `user_id`=?', userId)
    if (!secret) return !notFoundIsFalse
    //  length
    if (token.length < 6) return false
    //  verify
    let result: boolean
    try {
        result = verifyToken(secret, token)
    } catch (e) {
        result = false
    }

    if (!result) {
        //  recovery
        const recovery = await sql.findOne('SELECT * FROM `users_2fa_recovery` WHERE  `user_id`=? AND `code`=? AND `used`=0', userId, token)
        if (!recovery) return false
    }

    return true
}