import express from 'express'
import { protect } from '../middlewares/auth.js'
import { imageMessageController, textMessageController } from '../controllers/messageController.js'

export const messageRouter = express.Router()

// route to send message
messageRouter.post('/text', protect, textMessageController)

// route to generate image
messageRouter.post('/image', protect, imageMessageController)