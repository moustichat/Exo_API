import 'dotenv/config'
import { logger } from './lib/logger'
import app from './app'

const port = process.env.PORT || 3000

app.listen(port, () => {
    logger.info(`Server running at port ${port}`)
})





/*
appliquer le middleware de secu OK
mettre les cors
faire un test voir avec mounhir
.env.example OK 
*/