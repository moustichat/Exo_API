import express, { type Request, type Response } from 'express'
import cookieParser from 'cookie-parser'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'
import { loggingMiddleware } from './middleware/logging.middleware'
import eventRouter from './routes/event.route'
import authRouter from './routes/auth.routes'
import userRouter from './routes/user.route'
import ticketRouter from './routes/ticket.route'

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(loggingMiddleware)

app.get('/', (request: Request, res: Response) => {
  res.send('Hi')
})

app.use('/api/v1/events', eventRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/tickets', ticketRouter)

app.use(notFoundHandler)
app.use(errorHandler)

export default app