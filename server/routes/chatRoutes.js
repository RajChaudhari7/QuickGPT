import express from 'express'
import { createChat, deleteChat, getChats } from '../controllers/chatController.js'
import { protect } from '../middlewares/auth.js'

export const chatRouter = express.Router()

// route to create chat
chatRouter.get('/create', protect, createChat)

//route to get chat
chatRouter.get('/get', protect, getChats)

// route to delete chat
chatRouter.post('/delete', protect, deleteChat)