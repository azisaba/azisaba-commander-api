import express from 'express';

const API_PORT = parseInt(process.env.PORT || '3000', 10);
const app = express();

app.get('/', (_, res) => {
    res.send('Hello world');
});

app.listen(API_PORT, () => console.log('Server is running'));