import jwt from 'jsonwebtoken'
import { StatusCodes } from 'http-status-codes'
import { ResponseMessage } from '../utils/ResponseMessage.js'
import admin from '../models/Admin.js'
import Expert from '../models/Expert.js'
import User from '../models/User.js'

export const auth = async (req, res, next) => {
    const token = req.header('auth')

    if (!token) {
        res.status(401).json({
            status: 401,
            message: ResponseMessage.TOKEN_NOT_AUTHORIZED,
            data: [],
        })
    } else {
        try {
            const decode = jwt.verify(token, process.env.SECRET_KEY)

            if (decode.userId) {
                const validUser = await User.findOne({
                    _id: decode.userId.id,
                    isDeleted: false,
                    isActive: true,
                })

                if (validUser) {
                    req.user = decode.userId.id
                    next()
                } else {
                    res.status(400).json({
                        status: 400,
                        message: ResponseMessage.USER_DISABLE,
                        data: [],
                    })
                }
            } else {
                res.status(400).json({
                    status: 400,
                    message: ResponseMessage.TOKEN_NOT_VALID,
                    data: [],
                })
            }
            // next();
        } catch (err) {
            return res.status(500).json({
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
            })
        }
    }
}

export const adminAuth = async (req, res, next) => {
    const token = req.header('auth')

    if (!token) {
        res.status(401).json({
            status: 401,
            message: ResponseMessage.TOKEN_NOT_AUTHORIZED,
            data: [],
        })
    } else {
        try {
            const decode = jwt.verify(token, process.env.SECRET_KEY)

            if (decode.admin) {
                const validAdmin = await admin.findOne({
                    _id: decode.admin.id,
                    isDeleted: false,
                })

                if (validAdmin) {
                    req.admin = decode.admin.id
                    next()
                } else {
                    res.status(400).json({
                        status: 400,
                        message: ResponseMessage.TOKEN_NOT_VALID,
                        data: [],
                    })
                }
            }
        } catch (err) {
            return res.status(500).json({
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
            })
        }
    }
}

export const expertAuth = async (req, res, next) => {
    const token = req.header('auth')

    if (!token) {
        res.status(401).json({
            status: 401,
            message: ResponseMessage.TOKEN_NOT_AUTHORIZED,
            data: [],
        })
    }

    try {
        const decode = jwt.verify(token, process.env.SECRET_KEY)

        if (decode.expertId) {
            const validExpert = await Expert.findOne({
                _id: decode.expertId.id,
                isDeleted: false,
                isActive: true,
            })

            if (validExpert) {
                req.expert = decode.expertId.id
                next()
            } else {
                res.status(400).json({
                    status: 400,
                    message: ResponseMessage.USER_DISABLE,
                    data: [],
                })
            }
        } else {
            res.status(400).json({
                status: 400,
                message: ResponseMessage.TOKEN_NOT_VALID,
                data: [],
            })
        }
    } catch (err) {
        return res.status(500).json({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ResponseMessage.INTERNAL_SERVER_ERROR,
        })
    }
}
