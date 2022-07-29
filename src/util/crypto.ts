import bcrypt from 'bcrypt'

let saltRounds = -1

/**
 * Generate salt rounds
 * @return number
 */
export const generateSaltRounds = async (): Promise<number> => {
    if (saltRounds > 0) return saltRounds
    //  generate
    let i = 10
    while (true) {
        const start = Date.now()
        await bcrypt.hash('test', i++)
        const end = Date.now()
        if (end - start > 1000) break
    }
    return saltRounds = i - 1
}

export const hash = async (data: any): Promise<string> => await bcrypt.hash(data, await generateSaltRounds())

export * from 'bcrypt'