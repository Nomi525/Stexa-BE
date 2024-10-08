import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema(
    {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'booking',
        },
        roomId: {
            type: String,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        chatType: {
            type: String,
            enum: ['room', 'booking'],
        },

        messages: [
            {
                senderId: {
                    type: mongoose.Schema.Types.ObjectId,
                    refPath: 'messages.senderModel',
                },
                receiverId: {
                    type: mongoose.Schema.Types.ObjectId,
                    refPath: 'messages.receiverModel',
                },
                message: {
                    type: String,
                },
                imageFile: [
                    {
                        file: {
                            type: String,
                        },
                    },
                ],

                time: {
                    type: Date,
                    default: Date.now,
                },
                senderModel: {
                    type: String,

                    enum: ['User', 'expert', 'admin'],
                },
                receiverModel: {
                    type: String,

                    enum: ['User', 'expert', 'admin'],
                },
            },
        ],
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
)

const Conversation = mongoose.model('Conversation', conversationSchema)

export default Conversation
