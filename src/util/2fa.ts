import * as speakeasy from 'speakeasy'
import * as sql from "./sql";
import {generateSecureRandomString} from "./util";

/**
 * register 2fa
 *
 * @param userId
 * @return TwoFAContent
 */
export const register = async (userId: number): Promise<TwoFAContent | null> => {
    //  check if user has already registered
    if ( await isRegistered(userId)) {
        return null
    }

    //  generate secret
    const secret = speakeasy.generateSecret(
        {
            length: 20,
            name: process.env["2FA_LABEL"] ?? "commander.azisaba.net",
            issuer: process.env["2FA_ISSUER"] ?? "AzisabaCommander"
        }
    )
    //  save secret formatted base64
    await sql.execute(
        "INSERT INTO `users_2fa` (`user_id`, `secret_key`) VALUES (? ,?)",
        userId,
        secret.base32
    );

    //  generate 10 recovery codes and save them
    const recoveryCodes = await Promise.all([
        generateSecureRandomString(5), // 1
        generateSecureRandomString(5), // 2
        generateSecureRandomString(5), // 3
        generateSecureRandomString(5), // 4
        generateSecureRandomString(5), // 5
    ])

    await sql.execute(
        "INSERT INTO `users_2fa_recovery` (`user_id`, `code`) VALUES (?, ?), (?, ?), (?, ?), (?, ?), (?, ?)",
        userId,
        recoveryCodes[0],
        userId,
        recoveryCodes[1],
        userId,
        recoveryCodes[2],
        userId,
        recoveryCodes[3],
        userId,
        recoveryCodes[4],
    )

    //  generate url
    const url = speakeasy.otpauthURL({
        secret: secret.ascii,
        label: encodeURIComponent(process.env["2FA_LABEL"] ?? "commander.azisaba.net"),
        issuer: process.env["2FA_ISSUER"] ?? "AzisabaCommander"
    });

    return {
        id: userId,
        url: url,
        recovery: recoveryCodes
    }
}

/**
 * verify 2fa
 *
 * @param userId
 * @param code
 * @param returnTrueIfSecretNotFond
 * @return Boolean
 */
export const verify = async (userId: number, code: string, returnTrueIfSecretNotFond = false): Promise<Boolean> => {

    //  get secret from db
    const secret = await sql.findOne(
        "SELECT `secret` FROM `users_2fa` WHERE `user_id` = ?",
        userId
    )
    if (!secret) return returnTrueIfSecretNotFond

    //  if token is recovery code
    if (code.length === 5) {
        const recoveryId = await sql.findOne(
            "SELECT `id`, `used` FROM `users_2fa_recovery` WHERE `user_id` = ? AND `code` = ? AND `used` = 0",
            userId,
            code,
        )
        if (!recoveryId) return false
        //  remark code used
        await sql.execute("UPDATE `users_2fa_recovery` SET `used` = 1 WHERE `id` = ?")

        return true
    }

    //  verify
    return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: code
    })
}

/**
 * disable 2fa. it needs to verify
 *
 * @param userId
 * @param code
 * @return Boolean
 */
export const disable = async (userId: number, code: string): Promise<Boolean> => {
    if (!await verify(userId, code))  return false

    //  delete secret
    await sql.execute(
        "DELETE FROM `users_2fa` WHERE `user_id` = ?",
        userId
    )
    //  delete recovery code
    await sql.execute(
        "DELETE FROM `users_2fa_recovery` WHERE `user_id` = ?",
        userId
    )

    return true
}

/**
 * check if 2fa has already been registered
 *
 * @param userId
 * @return Boolean
 */
export const isRegistered = async (userId: number): Promise<Boolean> => {
    return await sql.findOne(
        "SELECT `id` FROM `users_2fa` WHERE `user_id` = ?",
        userId
    ) !== null
}