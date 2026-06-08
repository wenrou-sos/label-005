import express from 'express'
import cors from 'cors'
import { initializeDatabase } from './database/init'
import ticketRoutes from './routes/tickets'

const app = express()
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001

initializeDatabase()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Repair Management API is running' })
})

app.use('/api/tickets', ticketRoutes)

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Not Found' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.info(`Server is running on http://localhost:${PORT}`)
})

export default app
