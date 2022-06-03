import express from "express"
import {router as permissionsRouter} from "./permissions"
import {router as groupRouter} from "./group"

export const router = express.Router();

//  User

/**
 * Get a list of users
 * Require group: admin
 *
 * Response:
 *
 */
router.get('/', async (req, res) => {

})

/**
 * Get a user profile
 * Require group: admin
 *
 * Parameters:
 * - id: user id
 */
router.get('/:id', async (req, res) => {

})

/**
 * delete a user
 * Require group: admin
 *
 * Parameters:
 * - id: user id
 */
router.delete('/:id', async (req, res) => {

})

//  Permission
router.use('/:id/permissions', permissionsRouter)
//  Group
router.use('/:id/group', groupRouter)

