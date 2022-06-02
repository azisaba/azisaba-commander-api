import express from "express"

export const router = express.Router();

/**
 * Get a list of user permissions
 * Require group: admin
 *
 * Parameters:
 * - id: user id
 */
router.get('/', async (req, res) => {

})

/**
 * Get a user permission
 * Require group: admin
 *
 * Parameters:
 * - id: user id
 * - pex_id: permission id
 */
router.get('/:pex_id', async (req, res) => {

})

/**
 * add a permission
 * Require group: admin
 *
 * Parameters:
 * - id: user id
 * - pex_id: permission id
 */
router.post('/:pex_id', async (req, res) => {

})

/**
 * delete a permission from user
 * Require group: admin
 *
 * Parameters:
 * - id: user id
 * - pex_id: permission id
 */
router.delete('/:pex_id', async (req, res) => {

})