import mongoose from 'mongoose'
import { Socket } from '../config/Socket.config.js'
import Conversation from '../models/Conversation.js'
import User from '../models/User.js'
import Expert from '../models/Expert.js'
import admin from '../models/Admin.js'
import { handleErrorResponse } from './CommonService.js'
import { StatusCodes } from 'http-status-codes'
import { ResponseMessage } from '../utils/ResponseMessage.js'

const activeSockets = {}

const generateRandomString = () => {
    const randomNumber = Math.floor(1000 + Math.random() * 9000)
    return `RM-${randomNumber}`
}

const determineReferalModel = async (userId) => {
    if (await User.exists({ _id: userId })) {
        return 'User'
    }
    if (await Expert.exists({ _id: userId })) {
        return 'expert'
    }
    if (await admin.exists({ _id: userId })) {
        return 'admin'
    }
    throw new Error('Unknown referal model')
}

export const createRoomId = async (req, res) => {
    try {
        const { senderId, receiverId } = req.body

        const chatType = 'room'
        const message = 'Welcome to Room Chat'

        const getRoom = await Conversation.findOne({
            'messages.senderId': senderId,
            'messages.receiverId': receiverId,
        })

        if (getRoom) {
            return res.status(200).json({
                data: getRoom,
            })
        } else {
            const roomId = generateRandomString()

            const senderModel = await determineReferalModel(senderId)
            const receiverModel = await determineReferalModel(receiverId)

            const getRoom = await Conversation.create({
                roomId,
                chatType,
                isAdmin: true,
                messages: [
                    {
                        senderId: senderId,
                        receiverId: receiverId,
                        senderModel,
                        receiverModel,
                        message,
                    },
                ],
            })

            return res.status(201).json({
                data: getRoom,
            })
        }
    } catch (error) {
        console.log(error)
        return handleErrorResponse(error)
    }
}
export const createBookingId = async (req, res) => {
    try {
        const { senderId, receiverId, bookingId } = req.body

        const chatType = 'booking'
        const message = 'Welcome to Booking Chat'

        const getchat = await Conversation.findOne({
            bookingId: bookingId,
            'messages.senderId': senderId,
            'messages.receiverId': receiverId,
        })

        if (getchat) {
            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.BOOKING_CHAT_ALREADY_EXIST,
                data: getchat,
            })
        } else {
            const senderModel = await determineReferalModel(senderId)
            const receiverModel = await determineReferalModel(receiverId)

            const getRoom = await Conversation.create({
                bookingId: bookingId,
                chatType,
                isAdmin: false,
                messages: [
                    {
                        senderId: senderId,
                        receiverId: receiverId,
                        senderModel,
                        receiverModel,
                        message,
                    },
                ],
            })

            return res.status(201).json({
                status: StatusCodes.OK,
                message: ResponseMessage.BOOKING_CHAT_CREATED,
                data: getRoom,
            })
        }
    } catch (error) {
        console.log(error)
        return handleErrorResponse(error)
    }
}

Socket.on('connection', async (socket) => {
    console.log('A Admin connected:', socket.id)

    socket.on('joinChatRoom', async (data) => {
        let room
        if (data.isAdmin) {
            room = data.roomId
        } else {
            room = data.bookingId
        }

        socket.join(room)
        activeSockets[socket.id] = room
        let conversation
        if (data.isAdmin) {
            conversation = await Conversation.findOne({
                roomId: room,
            })
        } else {
            conversation = await Conversation.findOne({
                bookingId: room,
            })
        }
        // previous messages if available

        if (conversation) {
            const messages = conversation.messages
            Socket.in(room).emit('PreviousMessages', messages)
        }
    })

    // Event: Send message
    socket.on(
        'sendMessage',
        async ({
            bookingId,
            roomId,
            senderId,
            receiverId,
            message,
            isAdmin,
        }) => {
            // Emit the message to all users in the room
            const room = roomId || bookingId

            const chatType = bookingId ? 'booking' : 'room'

            // if (!room) {
            //     roomId = generateRandomString()
            // }

            socket
                .to(room)
                .emit('receiveMessage', { senderId, message, isAdmin })

            let conversation

            const isValidObjectId = mongoose.Types.ObjectId.isValid(room)
            if (room !== undefined) {
                if (!isValidObjectId) {
                    // If room is not a valid ObjectId, search by roomId
                    conversation = await Conversation.findOne({
                        roomId: room,
                    }).exec()
                } else {
                    conversation = await Conversation.findOne({
                        bookingId: new mongoose.Types.ObjectId(room),
                    }).exec()
                }
            }

            const senderModel = await determineReferalModel(senderId)
            const receiverModel = await determineReferalModel(receiverId)

            // Assuming conversation is already defined or fetched earlier in the code
            if (!conversation) {
                let conversationData = {
                    isAdmin,
                    chatType,
                    messages: [
                        {
                            senderId,
                            senderModel,
                            receiverId,
                            receiverModel,
                            message,
                        },
                    ],
                }

                // Check if room is defined and not null
                if (room !== undefined && room !== null) {
                    conversationData.bookingId = room
                }
                // Check if roomId is defined and not null
                else if (roomId !== undefined && roomId !== null) {
                    conversationData.roomId = roomId
                }

                // Create a new conversation with the constructed data
                conversation = new Conversation(conversationData)
            } else {
                // If conversation already exists, add the new message to the messages array
                conversation.messages.push({
                    senderId,
                    senderModel,
                    receiverId,
                    receiverModel,
                    message,
                })
            }

            // Save the conversation
            await conversation
                .save()
                .then(() => {
                    console.log('Conversation saved successfully')
                })
                .catch((error) => {
                    console.error('Error saving conversation:', error)
                })

            // Emit previous messages to the sender
            const messages = conversation.messages
            Socket.in(room).emit('PreviousMessages', messages)
        }
    )

    // Event: Disconnect
    socket.on('disconnect', () => {
        console.log('A Admin disconnected:', socket.id)
        const room = activeSockets[socket.id]
        if (room) {
            socket.leave(room)
            delete activeSockets[socket.id]
        }
    })
})

export const singleChatUploadMedia = async (req, res) => {
    const { senderId, receiverId, roomId, bookingId, message } = req.body

    try {
        let conversation = await Conversation.findOne({
            roomId,
            'messages.senderId': senderId,
            'messages.receiverId': receiverId,
        })
        if (bookingId) {
            conversation = await Conversation.findOne({
                bookingId,
                'messages.senderId': senderId,
                'messages.receiverId': receiverId,
            })
        }

        // if (!conversation) {
        //     const roomID = generateRandomString()
        //     conversation = new Conversation({
        //         roomId: roomID,
        //         messages: [],
        //     })
        // }

        const multipleFiles = req.files['chatImage']
            ? req.files['chatImage'].map((file) => ({ file: file.filename }))
            : []

        const senderModel = await determineReferalModel(senderId)
        const receiverModel = await determineReferalModel(receiverId)

        const newMessage = {
            senderId,
            receiverId,
            imageFile: multipleFiles,
            senderModel,
            receiverModel,
            message,
            time: new Date(),
        }
        conversation.messages.push(newMessage)

        await conversation.save()
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.IMAGE_SENT,
            data: newMessage,
        })
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}
