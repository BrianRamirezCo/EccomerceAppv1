import express from 'express'
import {placeOrder , placeOrderStripe , placeOrderRazorpay , allOrders , userOrders , updateStatus, verifyStripe } from '../controllers/orderControllers.js'
import authUser from '../middleware/userAuth.js'
import adminAuth from '../middleware/adminAuth.js'

const orderRoutes = express.Router()

//Admin Features
orderRoutes.post('/list', adminAuth ,allOrders)
orderRoutes.post('/status',adminAuth ,updateStatus)

//Payment Features
orderRoutes.post('/place', authUser, placeOrder)
orderRoutes.post('/stripe',authUser, placeOrderStripe)
orderRoutes.post('/orders',authUser, placeOrderRazorpay)

//User Features
orderRoutes.post('/userorders',authUser, userOrders)

//Verify payment
orderRoutes.post('/verifyStripe',authUser , verifyStripe)




export default orderRoutes;