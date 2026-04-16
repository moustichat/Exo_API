import express, { type Request, type Response } from 'express';
import 'dotenv/config';
import eventRouter from './routes/event.route'
import authRouter from './routes/auth.routes'
import userRouter from './routes/user.route'

const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());

app.get('/', (request: Request, res: Response) => {
    res.send('Hi')
})


app.use('/api/v1/events', eventRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)


app.listen(3000, () => {
    console.log(`Server running at port ${port}`)
})