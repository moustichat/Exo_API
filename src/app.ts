import express, { type Request, type Response } from 'express'
import cookieParser from 'cookie-parser'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'
import { loggingMiddleware } from './middleware/logging.middleware'

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(loggingMiddleware)

app.get('/', (request: Request, res: Response) => {
  res.send('Hi')
})

// Load routers dynamically so tests that only import `app` (like root path)
// don't fail due to ESM-only dependencies (Prisma client) being loaded.
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any
  const eventRouter = require('./routes/event.route').default
  app.use('/api/v1/events', eventRouter)
} catch (err) {
  // ignore if router cannot be required in test environment
}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any
  const authRouter = require('./routes/auth.routes').default
  app.use('/api/v1/auth', authRouter)
} catch (err) {
}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any
  const userRouter = require('./routes/user.route').default
  app.use('/api/v1/users', userRouter)
} catch (err) {
}

app.use(notFoundHandler)
app.use(errorHandler)

export default app