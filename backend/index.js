import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js';
dotenv.config();
await connectDB()
const app=express();
app.use(express.json())
import userRoutes from './routes/user.js'
app.use('/api/v1',userRoutes)
const PORT=process.env.PORT||5000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);    
})