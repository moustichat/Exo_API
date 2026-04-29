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
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173', // Origin autorisée
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Méthodes HTTP autorisées
  allowedHeaders: ['Content-Type', 'Authorization'], // Headers autorisés
  credentials: true, // Autoriser les cookies / headers d'authentification
}));



app.listen(port, () => {
    logger.info(`Server running at port ${port}`)
})
