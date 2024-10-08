import bcrypt from 'bcryptjs'
import * as geolib from 'geolib'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import Booking from '../models/Booking.js'
import Expert from '../models/Expert.js'
// import Order from '../models/PlaceOrder.js'
import { ResponseMessage } from '../utils/ResponseMessage.js'
import ServicesProductList from '../models/ServicesProductList.js'
import Order from '../models/PlaceOrder.js'
import ReturnOrder from '../models/ReturnOrder.js'
import Refund from '../models/Refund.js'

export const generateToken = ({ payload }) => {
    return jwt.sign(payload, process.env.SECRET_KEY)
}

export const encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10)
    const encryptedPassword = await bcrypt.hash(password, salt)
    return encryptedPassword
}

export const generateOtp = () => {
    let otp = Math.floor(1000 + Math.random() * 9000)
    return otp
}

async function generateId(model, field, prefix) {
    let lastNumber = 0

    // Find the last document in the collection
    const lastDocument = await model
        .findOne({}, { [field]: 1 })
        .sort({ _id: -1 })
        .lean()
        .exec()

    if (lastDocument && lastDocument[field]) {
        lastNumber = parseInt(lastDocument[field].split('-')[1], 10)
    }

    const newNumber = lastNumber + 1
    const formattedNumber = String(newNumber).padStart(7, '0')
    const newId = `${prefix}${formattedNumber}`

    return newId
}

// Usage examples:
export async function generateBookingId() {
    return generateId(Booking, 'bookingId', 'ST-')
}

export async function generateOrderId() {
    return generateId(Order, 'orderId', 'OID-')
}

export async function generateServiceProductId() {
    return generateId(ServicesProductList, 'serviceproductId', 'SP-')
}

export async function generateReturnId() {
    return generateId(ReturnOrder, 'returnOrderId', 'REQ-')
}

export async function generateRefundId() {
    return generateId(Refund, 'refundId', 'RF-')
}

export async function generateInvoiceId() {
    const prefix = 'invoiceId-'
    const randomString = generateRandomString(7)

    const newId = `${prefix}${randomString}`

    return newId
}

function generateRandomString(length) {
    const characters = '0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length)
        result += characters.charAt(randomIndex)
    }
    return result
}

function handleErrorResponse(res, error) {
    return res.status(500).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.INTERNAL_SERVER_ERROR,
        data: error.message,
    })
}

function generatePassword() {
    const length = 10
    const charset =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' // You can include special characters here if needed
    let password = ''
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length)
        password += charset[randomIndex]
    }
    return password
}

// function convertTimeToUnix(dateStr, timeStr) {
//     const date = new Date(dateStr)
//     const [hours, minutes] = timeStr.split(':').map(Number)
//     date.setHours(hours, minutes, 0, 0)
//     return date.getTime()
// }

function convertTimeToUnix(date, time) {
    const [hours, minutes] = time.split(':').map(Number)
    date.setHours(hours, minutes, 0, 0)
    return date.getTime() / 1000 // Convert milliseconds to seconds
}

// Function to format date as dd-mm-yyyy
function formatDate(date) {
    const d = new Date(date)
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
}
function getDatesInRange(startDate, endDate) {
    const dates = []
    let currentDate = new Date(startDate)
    let finalDate = new Date(endDate)

    // Swap start and end dates if start date is after end date
    if (currentDate > finalDate) {
        const temp = currentDate
        currentDate = finalDate
        finalDate = temp
    }

    while (currentDate <= finalDate) {
        dates.push(formatDate(currentDate))
        currentDate.setDate(currentDate.getDate() + 1)
    }

    return dates
}

function getMonthsInRange(startMonth, endMonth) {
    const months = []
    let currentMonth = new Date(startMonth)
    let finalMonth = new Date(endMonth)

    if (currentMonth > finalMonth) {
        const temp = currentMonth
        currentMonth = finalMonth
        finalMonth = temp
    }

    while (currentMonth <= finalMonth) {
        months.push(formatMonth(currentMonth))
        currentMonth.setMonth(currentMonth.getMonth() + 1)
    }

    return months
}

function formatMonth(date) {
    const d = new Date(date)
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()
    return `${month}-${year}`
}

// async function parseQueryParameters(
//     req,
//     models,
//     fields,
//     populates = [],
//     otherQuery = {}
// ) {
//     const page = Math.max(0, Number(req.query.page) - 1) || 0
//     const perPage = Number(req.query.perPage) || ''
//     const sortKey = String(req.query.sortKey) || ''

//     const searchQuery = String(req.query.search) || ''

//     const regex = new RegExp(searchQuery.split(' ').join('|'), 'i')
//     const sortQuery = {}
//     sortQuery[sortKey !== 'undefined' ? sortKey : 'createdAt'] = -1

//     const filter = []

//     fields.split(' ').map((field) => {
//         if (
//             field === 'isActive' ||
//             field === 'roleId' ||
//             field === 'bannerImage'
//         ) {
//             return
//         }

//         models.schema.paths[field]?.instance === 'String'
//             ? filter.push({ [field]: regex })
//             : null
//     })

//     let query = {
//         isDeleted: false,
//         // $or: filter,
//     }

//     const finalquery = {
//         ...query,
//         ...otherQuery,
//     }

//     // // Booking type filter
//     // const bookingType = req.query.bookingType;
//     // if (bookingType) {
//     //     otherQuery.bookingType = bookingType;
//     // }

//     // // Date filter
//     //     const dateRange = req.query.dateRange;
//     //     if (dateRange) {
//     //         let date;
//     //         const days = Number(dateRange);

//     //         if (days === 7 || days === 30 || days === 60) {
//     //             date = new Date();

//     //             date.setDate(date.getDate() - days);

//     //             otherQuery.bookingDateTime = { $gte: date };

//     //         }
//     //     }

//     let data = await models
//         .find({ ...finalquery })
//         .select(fields)
//         .sort(sortQuery)
//         .limit(perPage)
//         .skip(perPage * page)
//         .populate(populates)

//     // Booking type filter
//     const bookingType = req.query.bookingType
//     if (bookingType) {
//         otherQuery.bookingType = bookingType
//     }

//     // Date filter
//     let bookingDateTimes = data.map((booking) => booking.bookingDateTime)

//     // Apply date filter if dateRange is provided
//     const dateRange = req.query.dateRange
//     if (dateRange) {
//         let date
//         const days = Number(dateRange)

//         if (days === 7 || days === 30 || days === 60) {
//              date = new Date()

//             date.setDate(date.getDate() - days)

//             date = date.getTime()
//             // Filter bookings based on the date
//             bookingDateTimes.filter(
//                 (bookingDateTime) => new Date(bookingDateTime) >= date
//             )
//         }
//     }

//     if (searchQuery) {
//         data = data.filter((item) => {
//             return filter.some((filterCondition) => {
//                 const key = Object.keys(filterCondition)[0]
//                 const value = filterCondition[key]
//                 return value.test(item[key])
//             })
//         })
//     }

//     const count = searchQuery
//         ? data.length
//         : await models.countDocuments(finalquery)

//     return { data: data, count, page: +req.query.page, perPage }
// }

async function getAvailableExperts(req) {
    let query = { isDeleted: false }

    // Filter by specializations
    if (req.query.specializations && req.query.specializations.length > 0) {
        const specializations = JSON.parse(req.query.specializations)
        query.specialization = {
            $in: Array.isArray(specializations)
                ? specializations
                : [specializations],
        }
    }

    // Filter by isAvailable
    if (req.query.isAvailable !== undefined) {
        query.isAvailable = req.query.isAvailable
    }

    // Filter by distance
    if (req.query.distance && req.query.latitude && req.query.longitude) {
        const userLocation = {
            latitude: parseFloat(req.query.latitude),
            longitude: parseFloat(req.query.longitude),
        }

        const distanceInKilometers = parseFloat(req.query.distance) * 1.60934 // Convert miles to kilometers

        const experts = await Expert.find(query)
        const filteredExperts = experts.filter((expert) => {
            const expertLocation = {
                latitude: parseFloat(expert.latitude),
                longitude: parseFloat(expert.longitude),
            }
            const dist = geolib.getDistance(userLocation, expertLocation)
            return dist / 1000 <= distanceInKilometers
        })
        query._id = { $in: filteredExperts.map((expert) => expert._id) } // Update query with filtered expert IDs
    }

    // Filter by availability
    if (req.query.availability) {
        const { date, startTime, endTime } = JSON.parse(req.query.availability)

        const availabilityDate = new Date(date)
        availabilityDate.setHours(0, 0, 0, 0)

        const startUnixTime = convertTimeToUnix(availabilityDate, startTime)
        const endUnixTime = convertTimeToUnix(availabilityDate, endTime)

        const availabilityQuery = {
            'availability.date': availabilityDate.getTime(),
            'availability.startTime': { $lte: startUnixTime },
            'availability.endTime': { $gte: endUnixTime },
        }

        query.$or = [availabilityQuery]
    }

    // Fetch experts based on the constructed query
    const availableExperts = await Expert.find(query)

    return availableExperts
}

export {
    generatePassword,
    handleErrorResponse,
    // parseQueryParameters,
    getAvailableExperts,
    formatMonth,
    formatDate,
    getDatesInRange,
    getMonthsInRange,
    //calculateTotalCost
}
