import { StatusCodes } from 'http-status-codes'
import { ResponseMessage } from '../../utils/ResponseMessage.js'
import { City, Country, State } from 'country-state-city'
import { handleErrorResponse } from '../../services/CommonService.js'
import Conversation from '../../models/Conversation.js'
import Booking from '../../models/Booking.js'
import About from '../../models/About.js'
import Transaction from '../../models/Transaction.js'
import mongoose from 'mongoose'

const populateMessages = async (conversations) => {
    for (const conversation of conversations) {
        for (const message of conversation.messages) {
            if (message.senderModel && message.senderId) {
                message.senderId = await mongoose
                    .model(message.senderModel)
                    .findById(message.senderId)
                    .select('name')
            }
            if (message.receiverModel && message.receiverId) {
                message.receiverId = await mongoose
                    .model(message.receiverModel)
                    .findById(message.receiverId)
                    .select('name')
            }
        }
    }
    return conversations
}
//#region About Us
export const addeditAboutUs = async (req, res) => {
    try {
        const { aboutUs, id } = req.body

        if (id) {
            const getAbout = await About.findById(id)
            if (getAbout) {
                getAbout.aboutUs = aboutUs
                await getAbout.save()
                return res.status(200).json({
                    status: StatusCodes.OK,
                    message: ResponseMessage.ABOUT_US_UPDATED,
                    data: getAbout,
                })
            }
        }
        const newAbout = new About({
            aboutUs,
        })

        const getAbout = await newAbout.save()
        if (getAbout) {
            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.ABOUT_US_ADDED,
                data: getAbout,
            })
        }
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
export const getAboutUs = async (req, res) => {
    try {
        const getAboutUs = await About.findOne({})

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ABOUT_US_FETCHED,
            data: getAboutUs,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
//#endregion

//#region get all Country, states and city
export const getAllStatesOfSpecificCountry = async (req, res) => {
    try {
        const { countryCode } = req.query

        let getAllWarehouse = await State.getStatesOfCountry(countryCode)
        if (getAllWarehouse.length) {
            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.ALL_STATE_FETCHED,
                data: getAllWarehouse,
            })
        } else {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.NO_STATE_FOUND,
                data: [],
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ResponseMessage.INTERNAL_SERVER_ERROR,
            data: [error.Message],
        })
    }
}
export const getAllCityOfSpecificStates = async (req, res) => {
    try {
        const { stateName } = req.query
        const countryCode = 'IN'

        const getAllCitiesOfState = (stateName, countryCode) => {
            const cities = City.getAllCities()
            return cities
                .filter(
                    (city) =>
                        city.stateCode === stateName &&
                        city.countryCode === countryCode
                )
                .map((city) => city.name)
        }

        // Usage example
        const citiesInState = getAllCitiesOfState(stateName, countryCode)
        if (citiesInState.length) {
            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.ALL_CITY_FETCHED,
                data: citiesInState,
            })
        } else {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.NO_CITY_FOUND,
                data: [],
            })
        }
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
export const getAllCountries = async (req, res) => {
    try {
        const getAllCountries = Country.getAllCountries()
        if (getAllCountries.length) {
            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.ALL_COUNTRY_FETCHED,
                data: getAllCountries,
            })
        } else {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.NO_COUNTRY_FOUND,
                data: [],
            })
        }
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
//#endregion

//#region chat
export const getAdminRoomIdList = async (req, res) => {
    try {
        const adminId = req.admin
        console.log(adminId, 'adminId')
        const conversations = await Conversation.find({
            chatType: 'room',
            $or: [
                { 'messages.senderId': adminId },
                { 'messages.receiverId': adminId },
            ],
        })
        console.log(conversations)
        for (let conversation of conversations) {
            // Use `execPopulate()` to handle the population on nested paths
            await conversation.populate({
                path: 'messages.senderId',
                select: 'name',
            })

            await conversation.populate({
                path: 'messages.receiverId',
                select: 'name',
            })
        }

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ROOM_ID_LIST_FETCHED,
            data: conversations,
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}
export const getUserRoomIdList = async (req, res) => {
    try {
        const data = await Conversation.find({ chatType: 'room' }).sort({
            createdAt: -1,
        })
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ROOM_ID_LIST_FETCHED,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
export const getUserChatBookingWiseList = async (req, res) => {
    try {
        const userBookingData = await Booking.find({ userId: req.user }).sort({
            createdAt: -1,
        })

        let ids = userBookingData.map((item) => item._id)
        const chatData = await Conversation.find({
            // chatType: 'booking',
            bookingId: { $in: ids },
        })

        const userChatData = await populateMessages(chatData)

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ROOM_ID_LIST_FETCHED,
            data: userChatData,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
export const getExpertChatBookingWiseList = async (req, res) => {
    try {
        const userBookingData = await Booking.find({
            expertId: req.expert,
        }).sort({
            createdAt: -1,
        })

        let ids = userBookingData.map((item) => item._id)
        const chatData = await Conversation.find({
            // chatType: 'booking',
            bookingId: { $in: ids },
        })

        const userChatData = await populateMessages(chatData)

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ROOM_ID_LIST_FETCHED,
            data: userChatData,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
export const getUserChatRoomWiseList = async (req, res) => {
    try {
        const chatData = await Conversation.find({
            $or: [
                { 'messages.senderId': req.user },
                { 'messages.receiverId': req.user },
            ],
            chatType: 'room',
        }).sort({
            createdAt: -1,
        })

        const userChatData = await populateMessages(chatData)
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ROOM_ID_LIST_FETCHED,
            data: userChatData,
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}
//#endregion

//#region Transaction History
export const getAllTransactionHistory = async (req, res) => {
    try {
        const data = await Transaction.find({})
            .populate({
                path: 'userId expertId',
                select: 'name email phoneNumber',
            })
            .sort({ createdAt: -1 })
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.TRANSACTION_HISTORY_FETCHED,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
export const getSingleTransactionHistory = async (req, res) => {
    try {
        const data = await Transaction.findById(req.query.id).populate({
            path: 'userId expertId',
            select: 'name email phoneNumber',
        })
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.SINGLE_TRANSACTION_HISTORY_FETCHED,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
//#endregion
