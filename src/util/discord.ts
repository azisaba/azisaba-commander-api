import process from "process";
import fetch from "node-fetch";

export const postNewUserReview = async (user: string, url: string): Promise<void> => {
    if (process.env.DISCORD_WEBHOOK_URL) {
        await fetch(
            process.env.DISCORD_WEBHOOK_URL,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'username': "AzisabaCommander API",
                    'embeds': [
                        {
                            'title': "新規ユーザー承認リクエスト",
                            'description': `username: ${user}\nurl: ${url}`,
                            'url': url,
                            'color': 5620992
                        }
                    ]
                })
            }
        )
    }
}

export const postLog = async (username: string, message: string): Promise<void> => {
    if (process.env.DISCORD_LOG_WEBHOOK_URL) {
        await fetch(
            process.env.DISCORD_LOG_WEBHOOK_URL,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'username': 'AzisabaCommander Logger' ,
                    'embeds': [
                        {
                            'title': "Log",
                            'description': message,
                            // 'color': Math.floor(Math.random() * 16777214) + 1,
                            // 'timestamp': new Date().toLocaleTimeString(undefined, { timeZone: 'Asia/Tokyo' }),
                            "author": {
                                "name": username
                            },
                        }
                    ]
                })
            }
        ).then(async (res) => {
            console.log(await res.json())
        })
    }
}