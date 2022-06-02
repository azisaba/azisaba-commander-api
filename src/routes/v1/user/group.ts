import express from "express";

export const router = express.Router();

/**
 * Get a group which user belonging to
 * Require group: admin
 *
 * Parameters:
 * - id: user id
 */
router.get('/', async (req, res) => {

})

/**
 * set user's group
 * Require group: admin
 *
 * Parameters:
 * - id: user id
 * Body:
 * - group_id: group name
 */
router.post('/', async (req, res) => {

})