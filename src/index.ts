import express, { type Request, type Response } from 'express';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import eventRouter from './routes/event.route'
import authRouter from './routes/auth.routes'
import userRouter from './routes/user.route'
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { loggingMiddleware } from './middleware/logging.middleware';
import { logger } from './lib/logger';

const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());
app.use(cookieParser());
app.use(loggingMiddleware);

app.get('/', (request: Request, res: Response) => {
    res.send('Hi')
})


app.use('/api/v1/events', eventRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)

app.use(notFoundHandler)
app.use(errorHandler)


app.listen(3000, () => {
    logger.info(`Server running at port ${port}`)
})