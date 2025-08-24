import express, { application } from 'express'
import 'dotenv/config'
import cors from 'cors'
import { connectDB } from './configs/db.js'
import { userRouter } from './routes/userRoutes.js'
import { chatRouter } from './routes/chatRoutes.js'
import { messageRouter } from './routes/messageRoutes.js'
import { transactionRouter } from './routes/transactionRoute.js'
import { stripeWebhooks } from './controllers/webhooks.js'

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())

// stripe webhooks
app.post('/api/stripe', express.raw({ type: 'application/json' }), stripeWebhooks)

await connectDB()

// Route
app.get('/', (req, res) => res.send('Server is working'))
app.use('/api/user', userRouter)
app.use('/api/chat', chatRouter)
app.use('/api/message', messageRouter)
app.use('/api/transaction', transactionRouter)

// PORT
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})