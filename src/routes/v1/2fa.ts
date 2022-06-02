import express from "express";
const debug = require('debug')('azisaba-commander-api:route:v1:2fa')
export const router = express.Router();

/**
 * Verify a 2fa
 *
 * Body:
 * - state: string
 * - code: 2fa code
 *
 * Response:
 * - 200: success
 * - 4xx: failed
 */
router.get('/', async (req, res) => {

})

/**
 * Register a 2fa
 *
 * Body:
 * - state: string
 *
 * Response:
 * - 200: success
 *  - message: string
 *  - url: string
 *  - qrcode: string
 *  - recovery: string[]
 * - 4xx: failed
 */
router.post('/', async (req, res) => {

})

/**
 * Delete 2fa setting. need 2fa code or recovery code.
 *
 * Body:
 * - state: string
 * - code: string
 *
 * Response:
 * - 200: success
 * - 4xx: failed
 */
router.delete('/', async (req, res) => {

})