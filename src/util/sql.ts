/**
 * Special Thanks [acrylic-style](https://github.com/acrylic-style)
 * this code provided from his repository.
 */

const debug = require('debug')('azisaba-commander-api:sql')
import mysql, {Connection, FieldInfo} from 'mysql'

/** @internal */
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_DATABASE
})

/**
 *  get Connection from connection pool
 *  @return Connection
 */
export const getConnection = (): Promise<Connection> => {
    return new Promise((resolve, rejects) => {
        pool.getConnection((err, connection) => {
            if (err) {
                debug(err)
                return rejects(err)
            }
            resolve(connection)
        })
    })
}

export const queryWithConnection = (connection: Connection, sql: string, ...values: Array<any>): Promise<{ results: Array<any>, fields: FieldInfo[] | undefined }> => {
    return new Promise((resolve, reject) => {
        if (sql.startsWith('SELECT * FROM `users` ') || sql.startsWith('SELECT * FROM users ')) {
            return reject(new Error('Unsafe SQL: ' + sql))
        }
        debug(sql, values)
        connection.query(sql, values, (error, results, fields) => {
            if (error) {
                debug(error)
                return reject(error)
            }
            resolve({results, fields})
        })
    })
}

export const execute = (sql: string, ...values: Array<any>): Promise<void> => {
    return new Promise((resolve, reject) => {
        debug(sql, values)
        pool.query(sql, values, (error) => {
            if (error) {
                debug(error)
                return reject(error)
            }
            resolve()
        })
    })
}

export const query = (sql: string, ...values: Array<any>): Promise<{ results: Array<any>, fields: FieldInfo[] | undefined }> => {
    return new Promise((resolve, reject) => {
        if (sql.startsWith('SELECT * FROM `users` ') || sql.startsWith('SELECT * FROM users ')) {
            return reject(new Error('Unsafe SQL: ' + sql))
        }
        debug(sql, values)
        pool.query(sql, values, (error, results, fields) => {
            if (error) {
                debug(error)
                return reject(error)
            }
            resolve({results, fields})
        })
    })
}

export const findOne = async (sql: string, ...values: Array<any>): Promise<any> => {
    if (!sql.toLowerCase().startsWith('insert')) return await query(sql, ...values).then(value => value.results[0] || null)
    const connection = await getConnection()
    await queryWithConnection(connection, sql, ...values)
    return await queryWithConnection(connection, "SELECT LAST_INSERT_ID() AS why").then(value => value.results[0] ? value.results[0]['why'] : null)
}

export const findOneWithConnection = async (connection: Connection, sql: string, ...values: Array<any>): Promise<any> => {
    const val = await queryWithConnection(connection, sql, ...values).then(value => value.results[0] || null)
    if (!sql.toLowerCase().startsWith('insert')) return val
    return await queryWithConnection(connection, "SELECT LAST_INSERT_ID() AS why").then(value => value.results[0] ? value.results[0]['why'] : null)
}

export const findAll = (sql: string, ...values: Array<any>): Promise<Array<any>> => query(sql, ...values).then(value => value.results)

export const init = async () => {
    //  TODO create table sql
    query('SELECT 1').then(async () => {
        debug('Connection is established')

        //  users table
        await findOne('SHOW TABLES LIKE "users"').then(async res => {
            if (!res) {
                debug('Creating users table')
                await execute(`create table users
                               (
                                   \`id\`          int auto_increment,
                                   \`username\`    varchar(64)  not null,
                                   \`password\`    varchar(255) not null,
                                   \`group\`       varchar(64)  not null,
                                   \`ip\`          varchar(255) not null,
                                   \`last_update\` DATETIME     not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
                                   constraint users_pk
                                       primary key (\`id\`)
                               )`)
                debug('Created users table')
            }
        })

        //  users_2fa table
        await findOne('SHOW TABLES LIKE "users_2fa"').then(async res => {
            if (!res) {
                debug('Creating users_2fa table')
                await execute(`create table users_2fa
                               (
                                   \`id\`         int auto_increment,
                                   \`user_id\`    int          not null,
                                   \`secret_key\` varchar(255) not null,
                                   constraint users_2fa_pk
                                       primary key (\`id\`)
                               )`)
                debug('Created users_2fa table')
            }
        })

        //  users_permission table
        await findOne('SHOW TABLES LIKE "users_permission"').then(async res => {
            if (!res) {
                debug('Creating users_permission table')
                await execute(`create table users_permission
                               (
                                   \`id\`            int auto_increment,
                                   \`user_id\`       int not null,
                                   \`permission_id\` int not null,
                                   constraint users_permission_pk
                                       primary key (\`id\`)
                               )`)
                debug('Created users_permission table')
            }
        })

        //  permissions table
        await findOne('SHOW TABLES LIKE "permissions"').then(async res => {
            if (!res) {
                debug('Creating permissions table')
                await execute(`create table permissions
                               (
                                   \`id\`      int auto_increment,
                                   \`name\`    varchar(255) not null,
                                   \`project\` varchar(255) not null,
                                   \`service\` varchar(255) not null,
                                   constraint permissions_pk
                                       primary key (\`id\`)
                               )`)
                debug('Created permissions table')
            }
        })

        //  sessions table
        await findOne('SHOW TABLES LIKE "sessions"').then(async res => {
            if (!res) {
                debug('Creating sessions table')
                await execute(`create table sessions
                               (
                                   \`state\`      varchar(255) not null,
                                   \`expires_at\` bigint       not null,
                                   \`user_id\`    int          not null,
                                   \`ip\`         varchar(255) not null,
                                   \`pending\`    tinyint(1) DEFAULT 0,
                                   constraint sessions_pk
                                       primary key (\`state\`)
                               )`)
                debug('Created sessions table')
            }
        })

        //  logs table
        await findOne('SHOW TABLES LIKE "logs"').then(async res => {
            if (!res) {
                debug('Creating logs table')
                await execute(`create table logs
                               (
                                   \`id\`          int auto_increment,
                                   \`user_id\`     int null,
                                   \`area\`        varchar(255) null,
                                   \`action\`      varchar(255) null,
                                   \`description\` varchar(512) null,
                                   \`date\`        DATETIME default CURRENT_TIMESTAMP null,
                                   constraint logs_pk
                                       primary key (\`id\`)
                               )`)
                debug('Created logs table')
            }
        })
    })
}

