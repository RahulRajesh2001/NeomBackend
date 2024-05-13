import mongoose from 'mongoose'

export function connectDB() {
  const password=process.env.MONGODB_PASSWORD;
  mongoose
    .connect(`mongodb+srv://rahulrjev:${password}@neomcluster.hklzlwe.mongodb.net/?retryWrites=true&w=majority&appName=NeomCluster`)
    .then(() => {
      console.log('MongoDB connected..!')
    })
    .catch((err) => {
      console.log(err)
    })
}
