export const UNDER_REVIEW_SESSION_LENGTH = 1000 * 60 * 60
export const SESSION_LENGTH = 1000 * 60 * 60 * 24 * 7
export const UNDER_REVIEW_TAG = 'under_review'
export const GROUP_USER = 'user'
export const GROUP_ADMIN = 'admin'
export const SessionStatus = {
    AUTHORIZED: 0,
    PENDING: -1,
    UNDER_REVIEW: -2,
    WAIT_2FA: -3
}