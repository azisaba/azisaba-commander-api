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
            resolve({ results, fields })
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
            resolve({ results, fields })
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
}

