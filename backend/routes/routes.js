import express from 'express';
import productRoutes from './productsRoutes.js'
import userRoutes from './userRoutes.js';
import cartRouter from './cartRoutes.js';
import orderRoutes from './orderRoute.js';

const router = express.Router();


router.use('/user', userRoutes);

router.use('/product', productRoutes);

router.use('/cart' , cartRouter)

router.use('/order' , orderRoutes)

export default router;