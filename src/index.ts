import 'dotenv/config'
import { logger } from './lib/logger'
import app from './app'
import cors from 'cors'

const port = process.env.PORT || 3000

/**
 * cors() — Cross-Origin Resource Sharing
 * Permet au frontend (port 5173 en dev) de faire des requêtes vers le backend (port 3000).
 * Sans ça, le navigateur bloque les requêtes cross-origin.
 */
app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

const server = app.listen(port, () => {
    logger.info(`Server running at port ${port}`)
})

// Capture unhandled errors
server.on('error', (error: any) => {
    logger.error('Server error:', error)
    process.exit(1)
})

process.on('unhandledRejection', (reason: any) => {
    logger.error('Unhandled rejection:', reason)
    process.exit(1)
})

process.on('uncaughtException', (error: any) => {
    logger.error('Uncaught exception:', error)
    process.exit(1)
})
