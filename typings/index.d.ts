declare type SessionTable = {
    [state: string]: Session
}

declare type Session = {
    state: string
    expires_at: number
    user_id: number
    ip: string
    pending: boolean
}