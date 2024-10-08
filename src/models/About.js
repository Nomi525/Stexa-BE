import mongoose from 'mongoose'

const AboutSchema = new mongoose.Schema({
    aboutUs: {
        type: String,
        required: true,
    },
})
export default mongoose.model('About', AboutSchema)
