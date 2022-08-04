import express from "express";
import {
    authorized,
    deleteSession,
    getSession,
    getSessionKey,
    protect,
    putSession
} from "../../util/util";
import * as twoFA from "../../util/2fa";
import {SessionStatus} from "../../util/constants";

const debug = require('debug')('azisaba-commander-api:route:v1:2fa')
export const router = express.Router();

/**
 * Verify a 2fa
 *
 * Body:
 * - code: 2fa code
 *
 * Response:
 * - 200: success
 * - 4xx: failed
 */
router.get('/', protect(async (req, res) => {
    // let session = await validateAndGetSession(req)
    const key = getSessionKey(req)
    if (!key) return res.status(401).send({error: "unauthorized"})
    const session = await getSession(key)
    if (!session) return res.status(401).send({error: "unauthorized"})

    //  check if this session need a 2fa
    if (session.pending !== SessionStatus.WAIT_2FA) {
        return res.status(403).send({error: "forbidden"})
    }

    //  check parameter
    if (!req.body || !req.body['code']) return res.status(400).send({error: "invalid_param"})
    const code = req.body['code']

    //  verify
    if (!await twoFA.verify(session.user_id, code)) {
        return res.status(400).send({error: "invalid_2fa_code"})
    }
    //  update session
    await deleteSession(session.state)
    await putSession({
        ...session,
        pending: SessionStatus.AUTHORIZED
    })

    return res.status(200).send({
        message: "authorized",
        state: session.state
    })
}))

/**
 * Register a 2fa
 *
 * Response:
 * - 200: success
 *  - message: string
 *  - url: string
 *  - qrcode: string
 *  - recovery: string[]
 * - 4xx: failed
 */
router.post('/', authorized(async (req, res, session) => {
    //  enable 2fa
    const content = await twoFA.register(session.user_id)
    if (!content) {
        //  return 403 if user have registered before
        return res.status(403).send({error: "forbidden"})
    }

    return res.status(200).send({
        url: content.url,
        recoveryCodes: content.recovery
    })
}))

/**
 * Delete 2fa setting. need 2fa code or recovery code.
 *
 * Body:
 * - code: string
 *
 * Response:
 * - 200: success
 * - 4xx: failed
 */
router.delete('/', authorized(async (req, res, session) => {
    //  check parameter
    if (!req.body || !req.body['code']) return res.status(400).send({error: "invalid_param"})
    const code = req.body['code']

    //  return 403 if user is not registered
    if (!await twoFA.isRegistered(session.user_id)) {
        return res.status(403).send({error: "forbidden"})
    }

    //  delete
    if (!await twoFA.disable(session.user_id, code)) {
        return res.status(400).send({error: "invalid_2fa_code"})
    }

    return res.status(200).send({message: "success"})
}))