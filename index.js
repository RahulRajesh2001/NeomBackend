import express from 'express'
import dotenv, { config } from 'dotenv'
import cors from 'cors'
dotenv.config()
import { connectDB } from './config/db.js'
import Razorpay from 'razorpay'
import errorMiddleware from './middlewares/error.js';
// import { fileURLToPath } from 'url';
// import path from 'path';


//handle uncaught exceptions
process.on('uncaughtException',(err)=>{
  console.log(`ERROR: ${err}`)
  console.log('Shutting down due to uncaught exception')
  process.exit(1)
})

connectDB()
const PORT = process.env.PORT
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// paths for frontend
// const userBuildPath = path.join(__dirname, '../user/dist');
// const adminBuildPath = path.join(__dirname, '../admin/dist');

// app.use(express.static(userBuildPath));
// app.use(express.static(adminBuildPath));


// Route for serving admin panel
// app.get("/admin/*", function (req, res) {
//   res.sendFile(
//       path.join(__dirname, "../admin/dist/index.html"),
//       function (err) {
//           if (err) {
//               res.status(500).send(err);
//           }
//       }
//   )
// })


// console.log(path.join(__dirname, "../user/dist/index.html"))

// Route for serving user panel
// app.get("/*", function (req, res) {
//   res.sendFile(
//       path.join(__dirname, "../user/dist/index.html"),
//       function (err) {
//           if (err) {
//               res.status(500).send(err);
//           }
//       }
//   )
// })

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
})



import userRouters from './routes/userRoutes.js'
import adminRouters from './routes/adminRoutes.js'
import authRouter from './routes/authRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'

app.use('/api/v1', userRouters)
app.use('/api/v1/admin', adminRouters)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1', paymentRoutes)

app.get('/api/getkey', (req, res) =>
  res.status(200).json({ key: process.env.RAZORPAY_API_KEY })
)

//Using error middleware
app.use(errorMiddleware)

const server=app.listen(process.env.PORT, () => {
  console.log(`Server started on ${PORT}`)
})


//Handle Unhandled Promise Rejection
process.on("unhandledRejection",(err)=>{
  console.log(`ERROR: ${err}`);
  console.log("Shutting down server due to Unhandled Rejection");
  server.close(()=>{
    process.exit(1);
  })
})

