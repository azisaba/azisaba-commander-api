/**
 *  SessionTable Type
 *  Array<state, Session>
 */
declare type SessionTable = {
    [state: string]: Session
}

/**
 *  Session Type
 *  state: string
 *  expires_at: number
 *  user_id: number
 *  ip: string
 *  pending: boolean
 */
declare type Session = {
    state: string
    expires_at: number
    user_id: number
    ip: string
    pending: int
}

/**
 *  Session status
 */
declare const SessionStatus = {
    AUTHORIZED: 0,
    PENDING: -1,
    UNDER_REVIEW: -2,
    WAIT_2FA: -3
}

/**
 *  User Type
 *  id: user id
 *  username: username
 *  group: group name
 */
declare type User = {
    id: number
    username: string
    group: string
}

/**
 *  Permission Type
 *  id: permission id
 *  name: permission name
 *  content: PermissionContent[]
 */
declare type Permission = {
    id: number
    name: string
    content: PermissionContent[]
}

/**
 *  Permission Content Type
 *
 *  Format rule
 *  project:service|project:service|...
 *
 *  project: docker-compose project
 *  service: docker-compose service
 */
declare type PermissionContent = {
    project: string
    service: string
}

/**
 *  Container Type
 *  id: docker container id
 *  docker_id: docker id
 */
declare type Container = {
    id: string
    docker_id: string
    name: string
    created_at: string
    project_name: string
    service_name: string
    status: ContainerStatus
}

/**
 *  ContainerStatus Type
 */
declare type ContainerStatus = {
    state: object
    network_stats: object
    memory_stats: object
    cpu_stats: object
}

/**
 *  Type includes 2fa url and recovery keys
 */
declare type TwoFAContent = {
    id: number
    url: string
    recovery: string[]
}