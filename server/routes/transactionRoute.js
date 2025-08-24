import express from 'express'
import { getPlans, purchasePlan } from '../controllers/transactionController.js'
import { protect } from '../middlewares/auth.js'

export const transactionRouter = express.Router()

// to get plan
transactionRouter.get('/plan', getPlans)

// to purchase the plan
transactionRouter.post('/purchase', protect, purchasePlan)