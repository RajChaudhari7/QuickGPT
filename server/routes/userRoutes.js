import express from 'express'
import { getPublishedImages, getUser, loginUser, registerUser } from '../controllers/userController.js'
import { protect } from '../middlewares/auth.js'

export const userRouter = express.Router()

// route to register user
userRouter.post('/register', registerUser)

// route to login user
userRouter.post('/login', loginUser)

// route to get user 
userRouter.get('/get', protect, getUser)

// route to get published image
userRouter.get('/published-images', getPublishedImages)