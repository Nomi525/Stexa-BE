import mongoose from 'mongoose'
import * as dotenv from 'dotenv'
dotenv.config()
import { ResponseMessage } from '../utils/ResponseMessage.js'

const dbConfig = () => {
    mongoose
        .connect(process.env.MONGO_URL)
        .then(() => {
            console.log(ResponseMessage.DATABASE_CONNECTED)
        })
        .catch((err) => {
            console.log(err)
        })
}

export default dbConfig
