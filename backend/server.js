import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import connectDb from './config/mongoDb.js';
import connectCloudinary from './config/cloudinary.js';
import router from './routes/routes.js';

//APP config
const app = express();
const PORT = process.env.PORT || 4000;
connectDb();
connectCloudinary();

//middleware configuration

app.use(express.json());
app.use(cors());

//api endpoint configuration

app.get('/', (req , res) => {
    res.send("Welcome")
})

app.use('/api', router)



app.listen(PORT, () => console.log('server listening on port :' + PORT))