import orderModel from '../models/orderModel.js'
import userModel from '../models/userModel.js'
import Stripe from 'stripe'

//global variables
const currency = 'inr'
const deliveryCharge = 10

// gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

//placing orders using Cod method
const placeOrder = async (req , res) =>{
    try {
        const { userId , items , amount , adress} = req.body;
        console.log(userId , items , amount , adress);
        
        

        const orderData = {
            userId,
            items,
            adress,
            amount,
            paymentMethod:'COD',
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId , {cartData:{}})

        res.json({success: true , message: 'Order Placed'})
    } catch (error) {
        console.log(error);
        res.json({success: false , message:error.message})
        
    }
}

const placeOrderStripe = async (req , res) =>{
    try {
        const {userId , items, amount , adress} = req.body
        const {origin} = req.headers;

        const orderData ={
            userId,
            items,
            adress,
            amount,
            paymentMethod:'stripe',
            payment:false,
            date: Date.now()
            }

            const newOrder = new orderModel(orderData)
            await newOrder.save()

            const line_items = items.map((item)=>({
                price_data:{
                    currency:currency,
                    product_data:{
                        name:item.name
                    },
                    unit_amount: item.price * 100
                },
                quantity: item.quantity
            }))

            line_items.push({
                price_data:{
                    currency:currency,
                    product_data:{
                        name:'Delivery Charges'
                    },
                    unit_amount: deliveryCharge * 100
                },
                quantity: 1
            })

            const session = await stripe.checkout.sessions.create({
                success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
                cancel_url:`${origin}/verify?success=false&orderId=${newOrder._id}`,
                line_items,
                mode: 'payment',
            })
            
            

            res.json({success:true,session_url:session.url})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
        
    }
}

const verifyStripe = async (req, res) => {
    const { orderId, success } = req.body;

    try {
        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.status(400).json({ success: false, message: 'Orden no encontrada' });
        }

        // Si success es 'false' significa que el usuario canceló el pago, entonces eliminamos la orden
        if (success === 'false') {
            await orderModel.findByIdAndDelete(orderId);
            return res.json({ success: false, message: 'Pago cancelado por el usuario' });
        }

        // Si success es 'true', verificamos si el pago se completó en Stripe
        const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);

        if (session.payment_status === 'paid') {
            // Si el pago fue completado, actualizamos la orden
            order.payment = true;
            await order.save();

            // Limpiar el carrito solo si el pago fue exitoso
            await userModel.findByIdAndUpdate(order.userId, { cartData: {} });

            return res.json({ success: true });
        } else {
            // Si el pago no fue exitoso, eliminamos la orden
            await orderModel.findByIdAndDelete(orderId);
            return res.json({ success: false, message: 'Pago no confirmado por Stripe' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

// const verifyStripe = async (req,res) =>{
//     const {orderId , success , userId} = req.body

//     try {
//         if(success === "true"){
//             await orderModel.findByIdAndUpdate(orderId , {payment:true})
//             await userModel.findByIdAndUpdate(userId, {cartData: {}})
//             res.json({success:true})
//         }else{
//             await orderModel.findByIdAndDelete(orderId)
//             res.json({success:false})
//         }
//     } catch (error) {
//         console.log(error)
//         res.json({success:false , message:error.message})
        
//     }
// }

const placeOrderRazorpay = async (req , res) =>{
    
}

const allOrders = async (req , res) =>{
    try {
        const orders = await orderModel.find({})
        res.json({success:true , orders})
    } catch (error) {
        console.log(error);
        res.json({success : false , message: error.message})
        
    }
}

const userOrders = async (req , res) =>{
    try {
        const {userId} = req.body

        const orders = await orderModel.find({userId})
        res.json({success : true , orders})
    } catch (error) {
        console.log(error);
        res.json({success : false , message: error.message})
    }
}

//update status from Admin Panel
const updateStatus = async (req , res) =>{
    try {
        const {orderId , status} = req.body

        await orderModel.findByIdAndUpdate(orderId , {status})
        res.json({success:true , message:'Status Updated'})
    } catch (error) {
        console.log(error)
        res.json({success:false , message:error.message})
        
        
    }
}

export {placeOrder , placeOrderStripe , verifyStripe , placeOrderRazorpay , allOrders , userOrders , updateStatus }
