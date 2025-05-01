import express from 'express';
import {addToCart , updateCart , getUserCart} from '../controllers/cartController.js'
import authUser from '../middleware/userAuth.js';

const cartRouter = express.Router();


cartRouter.get('/get' , authUser , getUserCart)
cartRouter.post('/add' , authUser , addToCart)
cartRouter.post('/update' , authUser , updateCart)

export default cartRouter;