import * as speakeasy from 'speakeasy'
import * as sql from "./sql";
import {generateSecureRandomString} from "./util";

/**
 * register 2fa
 *
 * @param user
 * @return TwoFAContent
 */
const register = async (user: User): Promise<TwoFAContent | null> => {
    if (!user.id) return null
    //  check if user has already registered
    if ( await sql.findOne("SELECT `id` FROM `users_2fa` WHERE `user_id`", user.id)) {
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
        user.id,
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
        user.id,
        recoveryCodes[0],
        user.id,
        recoveryCodes[1],
        user.id,
        recoveryCodes[2],
        user.id,
        recoveryCodes[3],
        user.id,
        recoveryCodes[4],
    )

    //  generate url
    const url = speakeasy.otpauthURL({
        secret: secret.ascii,
        label: encodeURIComponent(process.env["2FA_LABEL"] ?? "commander.azisaba.net"),
        issuer: process.env["2FA_ISSUER"] ?? "AzisabaCommander"
    });

    return {
        id: user.id,
        url: url,
        recovery: recoveryCodes
    }
}

/**
 * verify 2fa
 *
 * @param user
 * @param code
 * @param returnTrueIfSecretNotFond
 * @return Boolean
 */
const verify = async (user: User, code: string, returnTrueIfSecretNotFond = false): Promise<Boolean> => {
    if (!user.id) return false

    //  get secret from db
    const secret = await sql.findOne(
        "SELECT `secret` FROM `users_2fa` WHERE `user_id` = ?",
        user.id
    )
    if (!secret) return returnTrueIfSecretNotFond

    //  if token is recovery code
    if (code.length == 5) {
        const recoveryId = await sql.findOne(
            "SELECT `id`, `used` FROM `users_2fa_recovery` WHERE `user_id` = ? AND `code` = ? AND `used` = 0",
            user.id,
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
 * @param user
 * @param code
 * @return Boolean
 */
const disable = async (user: User, code: string): Promise<Boolean> => {
    if (!await verify(user, code))  return false

    //  delete secret
    await sql.execute(
        "DELETE FROM `users_2fa` WHERE `user_id` = ?",
        user.id
    )
    //  delete recovery code
    await sql.execute(
        "DELETE FROM `users_2fa_recovery` WHERE `user_id` = ?",
        user.id
    )

    return true
}

/**
 * check if 2fa has already been registered
 *
 * @param user
 * @return Boolean
 */
const isRegistered = async (user: User): Promise<Boolean> => {
    if (!user.id) return false
    return await sql.findOne(
        "SELECT `id` FROM `users_2fa` WHERE `user_id` = ?",
        user.id
    )
}