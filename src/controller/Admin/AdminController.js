import bcrypt from 'bcryptjs'
import moment from 'momnet'
import admin from '../../models/Admin.js'
import { ResponseMessage } from '../../utils/ResponseMessage.js'
import StatusCodes from 'http-status-codes'
import {
    encryptPassword,
    // generateOtp,
    generateToken,
    handleErrorResponse,
} from '../../services/CommonService.js'
import { sendVerificationEmailOTP } from '../../services/EmailServices.js'
import User from '../../models/User.js'
import CMS from '../../models/CMS.js'
import ContactUs from '../../models/ContactUs.js'
import FAQs from '../../models/FAQs.js'
import Specialization from '../../models/Specialization.js'
import Settings from '../../models/Settings.js'
import Booking from '../../models/Booking.js'
import Expert from '../../models/Expert.js'
import PlaceOrder from '../../models/PlaceOrder.js'

// export const register = async (req, res) => {
//     const { name, email, password, phoneNumber } = req.body

//     try {
//         const existingUserEmail = await admin.findOne({ email })

//         if (existingUserEmail) {
//             return res.status(409).json({
//                 status: StatusCodes.CONFLICT,
//                 message: ResponseMessage.USER_EMAIL_ALREADY_EXIST,
//             })
//         }
//         const existingPhoneNumber = await admin.findOne({ phoneNumber })
//         if (existingPhoneNumber) {
//             return res.status(409).json({
//                 status: StatusCodes.CONFLICT,
//                 message: ResponseMessage.PHONE_NO_ALREADY_EXIST,
//             })
//         }

//         // let imagePath = ''
//         if (req.file) {
//             req.body.image = req.file.filename
//         }

//         const emailsent = await sendVerificationEmail(email, password)
//         if (emailsent) {
//             const adminData = {
//                 name,
//                 email,
//                 password,
//                 phoneNumber,
//                 image: req.body.image,
//             }

//             const Admin = await admin.create(adminData)
//             const encryptedPassword = await encryptPassword(password)
//             await Admin.updateOne({
//                 $set: { password: encryptedPassword },
//             })

//             return res.status(201).json({
//                 status: StatusCodes.CREATED,
//                 message: ResponseMessage.SENT_OTP,
//                 data: { admin_id: admin._id },
//             })
//         }
//     } catch (err) {
//         return res.status(500).json({
//             status: StatusCodes.INTERNAL_SERVER_ERROR,
//             message: ResponseMessage.INTERNAL_SERVER_ERROR,
//             data: err.message,
//         })
//     }
// }

//#endregion

//#region Login Admin

export const login = async (req, res) => {
    try {
        const { email, phoneNumber, password } = req.body

        const findQuery = {
            $or: [{ email }, { phoneNumber }],
            isDeleted: false,
        }

        const findAdmin = await admin.findOne(findQuery)

        if (!findAdmin) {
            return res.status(401).json({
                status: StatusCodes.UNAUTHORIZED,
                message: ResponseMessage.INVALID_CREDENTIALS,
            })
        }

        const isMatch = await bcrypt.compare(password, findAdmin.password)
        if (!isMatch) {
            return res.status(401).json({
                status: StatusCodes.UNAUTHORIZED,
                message: ResponseMessage.INVALID_CREDENTIALS,
            })
        }

        const payload = { admin: { id: findAdmin._id } }
        const token = generateToken({ payload, ExpiratioTime: '1h' })

        const data = await admin.findByIdAndUpdate(
            { _id: findAdmin._id },
            { $set: { token } }
        )

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ADMIN_LOGGEDIN,
            token,
            data: data._id,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ResponseMessage.INTERNAL_SERVER_ERROR,
        })
    }
}

//#endregion
//#region Update Admin

export const updateAdmin = async (req, res) => {
    try {
        let { name, email, phoneNumber, roleId, address } = req.body

        if (req.file) {
            req.body.OldImageFile = req.body.image
            req.body.image = req.file.filename
        }
        const updateAdmin = await admin.findByIdAndUpdate(
            { _id: req.admin },
            {
                $set: {
                    name,
                    email,
                    image: req.body.image,
                    phoneNumber,
                    roleId,
                    address,
                },
            },
            { new: true }
        )
        if (updateAdmin) {
            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.ADMIN_UPDATED,
                data: updateAdmin,
            })
        } else {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.ADMIN_NOT_FOUND,
            })
        }
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}

//#endregion

//#region Logout
export const logout = async (req, res) => {
    try {
        const adminId = req.admin
        const logoutadmin = await admin.findByIdAndUpdate(
            {
                _id: adminId,
            },
            { $set: { token: null } },
            { new: true }
        )

        return res.status(200).send({
            success: StatusCodes.OK,
            message: ResponseMessage.ADMIN_LOGOUT,
            data: logoutadmin,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
// #endregion

// #region Forgot Password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        const findAdmin = await admin.findOne({ email })

        if (!findAdmin) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.EMAIL_NOT_FOUND,
                data: [],
            })
        }
        // const otp = generateOtp()
        const otp = 4444
        const otpExpiryTime = new Date(Date.now() + 34 * 1000).getTime()
        const updateOTP = await admin
            .findOneAndUpdate(
                { _id: findAdmin._id },
                {
                    $set: { otp, otpExpire: otpExpiryTime },
                }
            )
            .select('_id otpExpire')

        await sendVerificationEmailOTP(findAdmin.email, otp)
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.SENT_OTP,
            data: {
                id: updateOTP._id,
                otpExpire: otpExpiryTime - new Date().getTime(),
            },
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
//#endregion

//#region Verify OTP
export const verifyOtp = async (req, res) => {
    try {
        let { otp, id } = req.body
        let adminId = await admin.findById({ _id: id })
        if (adminId.otp != otp) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.INVALID_OTP,
                daa: [],
            })
        } else {
            if (adminId.otpExpire < new Date().getTime()) {
                return res.status(401).json({
                    status: StatusCodes.UNAUTHORIZED,
                    message: ResponseMessage.OTP_EXPIRED,
                })
            }

            await admin.findByIdAndUpdate(
                { _id: id },
                { $set: { otp: null, otpExpire: null, isVerified: true } },
                { new: true }
            )
            res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.VERIFICATION_COMPLETED,
                data: [],
            })
        }
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}
//#endregion

//#region resend otp

export const resendOTP = async (req, res) => {
    try {
        const { id, check } = req.body
        const currentTime = Date.now()
        const findUser = await admin.findOne({ _id: id })

        if (!findUser) {
            return res.status(400).json({
                message: ResponseMessage.EMAIL_NOT_FOUND,
                data: [],
            })
        }

        let otpExpiryTime = findUser.otpExpire
        const isExpired =
            !findUser.otpExpire || currentTime >= findUser.otpExpire

        if (!check) {
            // const otp = generateOtp()
            let otp = 4444
            otpExpiryTime = new Date(currentTime + 34 * 1000).getTime()

            await admin
                .findOneAndUpdate(
                    { _id: findUser._id },
                    { $set: { otp, otpExpire: otpExpiryTime } }
                )
                .select('_id')

            await sendVerificationEmailOTP(findUser.email, otp)
        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            message: isExpired ? ResponseMessage.RESENT_OTP : '',
            data: {
                id: findUser._id,
                otpExpire: otpExpiryTime - new Date().getTime(),
            },
        })
    } catch (err) {
        console.log(err)
        return handleErrorResponse(res, err)
    }
}

//#end region
//#region Reset password
export const resetPassword = async (req, res) => {
    try {
        let { newPassword, id } = req.body
        let exist = await admin.findOne({ _id: id })
        if (exist) {
            const validPassword = await bcrypt.compare(
                newPassword,
                exist.password
            )
            if (!validPassword) {
                const password = await encryptPassword(newPassword)
                await admin.findByIdAndUpdate(
                    { _id: id },
                    { $set: { password } }
                )
                if (!password) {
                    return res.status(400).json({
                        status: StatusCodes.BAD_REQUEST,
                        message: ResponseMessage.SOMETHING_WENT_WRONG,
                    })
                } else {
                    return res.status(200).json({
                        status: StatusCodes.OK,
                        message: ResponseMessage.RESET_PASSWORD,
                        data: resetPassword,
                    })
                }
            } else {
                res.status(400).json({
                    status: StatusCodes.BAD_REQUEST,
                    message: ResponseMessage.OLD_NEW_PASSWORD_ARE_MATCH,
                    data: [],
                })
            }
        } else {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.ADMIN_NOT_FOUND,
            })
        }
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}
//#endregion

//#region changePassword
export const changePassword = async (req, res) => {
    try {
        const { newPassword, oldPassword } = req.body
        if (!newPassword && !oldPassword) {
            return res.status(404).json({
                message: ResponseMessage.FIELDS_NOT_FOUND,
            })
        }
        const user = await admin.findById({ _id: req.admin })
        if (!(await bcrypt.compare(oldPassword, user.password))) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.OLDPASSWORD_DONT_MATCH,
                data: [],
            })
        }
        user.password = await encryptPassword(newPassword)
        user.save()
        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            message: ResponseMessage.PASSWORD_UPDATED_SUCCESSFULLY,
        })
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}
//#endregion
//#region getUserList

export const getUserList = async (req, res) => {
    try {
        const data = await User.find({ isDeleted: false }).sort({
            createdAt: -1,
        })

        return res.status(200).json({
            message: ResponseMessage.ALL_EXPERT,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}

//#endregion

//#region cms details
export const addEditCmsDetails = async (req, res) => {
    try {
        const data = await CMS.findOne()

        if (data) {
            let updatedData = await addUpdateInDB(data, req.body)

            return res.status(200).json({
                status: StatusCodes.OK,
                message: updatedData.responseMessage,
                data: updatedData.dbData,
            })
        } else {
            const newData = await new CMS()

            let updatedData = await addUpdateInDB(newData, req.body)

            return res.status(201).json({
                status: StatusCodes.CREATED,
                message: updatedData.responseMessage,
                data: updatedData.dbData,
            })
        }
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
//#endregion

//#region function addupdate cms in db
const addUpdateInDB = async (dbData, DataToAddUpdate) => {
    let { description, cmsType } = DataToAddUpdate

    let responseMessage
    let updateCall = false
    switch (Number(cmsType)) {
        case 0:
            updateCall = dbData.privacyPolicy ? true : false

            dbData.privacyPolicy = description

            responseMessage = updateCall
                ? ResponseMessage.PRIVACY_POLICY_UPDATED
                : ResponseMessage.PRIVACY_POLICY_ADDED
            break
        case 1:
            updateCall = dbData.termsCondition ? true : false
            dbData.termsCondition = description
            responseMessage = updateCall
                ? ResponseMessage.TERMS_AND_CONDITION_UPDATED
                : ResponseMessage.TERMS_AND_CONDITION_ADDED
            break
        case 2:
            updateCall = dbData.refundPolicy ? true : false
            dbData.refundPolicy = description
            responseMessage = updateCall
                ? ResponseMessage.REFUND_POLICY_UPDATED
                : ResponseMessage.REFUND_POLICY_ADDED
            break
        case 3:
            updateCall = dbData.aboutUs ? true : false
            dbData.aboutUs = description
            responseMessage = updateCall
                ? ResponseMessage.ABOUT_US_UPDATED
                : ResponseMessage.ABOUT_US_ADDED
            break
        case 4:
            updateCall = dbData.legal_notice ? true : false
            dbData.legal_notice = description
            responseMessage = updateCall
                ? ResponseMessage.LEGAL_NOTICE_UPDATED
                : ResponseMessage.LEGAL_NOTICE_ADDED
            break
        default:
            throw new Error('Invalid cms_type')
    }
    try {
        await dbData.save()
        return { dbData, responseMessage }
    } catch (error) {
        return handleErrorResponse(error)
    }
}
//#endregion

//#region get Cms details
export const getCmsDetails = async (req, res) => {
    try {
        const data = await CMS.findOne()
        return res
            .status(200)
            .json({
                status: StatusCodes.OK,
                message: ResponseMessage.CMS_DETAILS_FETCHED,
                data: data,
            })
            .sort({ createdAt: -1 })
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}
//#endregion

//#region addEdit SubAdmin

export const addEditSubAdmin = async (req, res) => {
    try {
        const adminId = req.admin
        let { name, email, password, phoneNumber, id, roleId } = req.body

        let existingUser = await admin.findOne({
            $or: [{ email }, { phoneNumber }],
            _id: { $ne: id },
        })
        console.log(existingUser)
        if (existingUser !== null) {
            if (existingUser.email === email) {
                return res.status(409).json({
                    status: StatusCodes.CONFLICT,
                    message: ResponseMessage.USER_EMAIL_ALREADY_EXIST,
                })
            }
            if (existingUser.phoneNumber === phoneNumber) {
                return res.status(409).json({
                    status: StatusCodes.CONFLICT,
                    message: ResponseMessage.PHONE_NO_ALREADY_EXIST,
                })
            }
        }

        if (adminId.type == 'Admin') {
            return res.status(401).json({
                status: StatusCodes.UNAUTHORIZED,
                message: ResponseMessage.NOT_RIGHTS_TO_ADD_ADMIN,
                data: [],
            })
        } else {
            if (id) {
                let update = await admin.findByIdAndUpdate(
                    { _id: id },
                    { $set: { name, email, phoneNumber, roleId } },
                    { new: true }
                )

                if (update) {
                    return res.status(200).json({
                        status: StatusCodes.OK,
                        message: ResponseMessage.SUBADMIN_UPDATED,
                        data: update,
                    })
                }

                if (update) {
                    return res.status(200).json({
                        status: StatusCodes.OK,
                        message: ResponseMessage.SUBADMIN_UPDATED,
                        data: update,
                    })
                } else {
                    return res.status(400).json({
                        status: StatusCodes.BAD_REQUEST,
                        message: ResponseMessage.BAD_REQUEST,
                        data: [],
                    })
                }
            } else {
                const encryptedPassword = await encryptPassword(password)
                // let already = await admin.findOne({
                //     $or: [{ email }, { phoneNumber }],
                //     isDeleted: false,
                //     _id: { $ne: id },
                // })
                // if (already) {
                //     if (already.email === email) {
                //         return res.status(409).json({
                //             status: StatusCodes.CONFLICT,
                //             message: ResponseMessage.USER_EMAIL_ALREADY_EXIST,
                //         })
                //     }
                //     if (already.phoneNumber === phoneNumber) {
                //         return res.status(409).json({
                //             status: StatusCodes.CONFLICT,
                //             message: ResponseMessage.PHONE_NO_ALREADY_EXIST,
                //         })
                //     }
                // }

                const newAdmin = await new admin({
                    name,
                    email,
                    phoneNumber,
                    password: encryptedPassword,
                    roleId,
                    type: 'SubAdmin',
                })
                await newAdmin.save().then(() => {
                    return res.status(201).json({
                        status: StatusCodes.CREATED,
                        message: ResponseMessage.SUBADMIN_CREATED,
                        data: newAdmin,
                    })
                })
            }
        }
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}

//#endregion

//#region removeAdmin
export const removeAdmin = async (req, res) => {
    try {
        let { id } = req.query
        let removeAdmin = await admin.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    isDeleted: true,
                },
            },
            { new: true }
        )
        if (!removeAdmin) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.BAD_REQUEST,
                data: [],
            })
        } else {
            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.SUBADMIN_REMOVED,
                data: [],
            })
        }
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
//#endregion

//#region getAllSubAdmin

export const getAllSubAdmin = async (req, res) => {
    try {
        const data = await admin
            .find({ $nor: [{ type: 'Admin' }], isDeleted: false })
            .select('-password')
            .populate({
                path: 'roleId',
                select: 'role',
            })
            .sort({ createdAt: -1 })

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ALL_SUBADMINS,
            data,
        })
    } catch (err) {
        console.log(err)
        return handleErrorResponse(res, err)
    }
}
//#endregion
export const subAdminActiveDeactive = async (req, res) => {
    try {
        const { id, status } = req.body
        const subAdmin = await admin.findOne({ _id: id })
        const newActiveStatus = !subAdmin.isActive

        const data = await admin.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    isActive: newActiveStatus,
                    status,
                },
            },
            { new: true }
        )
        return res.status(200).json({
            status: StatusCodes.OK,
            message: !newActiveStatus
                ? ResponseMessage.SUBADMIN_DEACTIVE
                : ResponseMessage.SUBADMIN_ACTIVE,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}

//#region getAdmin
export const getAdmin = async (req, res) => {
    try {
        let { id } = req.query
        const adminId = await admin.findById(
            {
                _id: id,
            },
            { isDeleted: false }
        )
        if (!adminId) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.BAD_REQUEST,
                data: [],
            })
        } else {
            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.ADMIN_DETAILS,
                data: adminId,
            })
        }
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
//#endregion

//#region contactUsList

export const contactUsList = async (req, res) => {
    try {
        const data = await ContactUs.find({ isDeleted: false })
            .select('email phoneNumber message')
            .sort({ createdAt: -1 })
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.CONTACTUS_LEAD_DETAILS_FETCHED,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
//#endregion

//#region addEditFAQs
export const addEditFAQs = async (req, res) => {
    try {
        let { question, answer, id } = req.body
        if (id) {
            let editFaq = await FAQs.findByIdAndUpdate(
                { _id: id },
                { $set: { question, answer } }
            )

            if (editFaq) {
                return res.status(200).json({
                    status: StatusCodes.OK,
                    message: ResponseMessage.FAQ_UPDATED,
                    data: editFaq,
                })
            } else {
                return res.status(400).json({
                    status: StatusCodes.BAD_REQUEST,
                    message: ResponseMessage.BAD_REQUEST,
                    data: [],
                })
            }
        } else {
            let addFaq = await new FAQs({
                question,
                answer,
            }).save()
            if (addFaq) {
                return res.status(201).json({
                    status: StatusCodes.CREATED,
                    message: ResponseMessage.FAQ_ADDED,
                    data: addFaq,
                })
            } else {
                return res.status(400).json({
                    status: StatusCodes.BAD_REQUEST,
                    message: ResponseMessage.BAD_REQUEST,
                    data: [],
                })
            }
        }
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
//#endregion

//#region removeFaq
export const removeFaq = async (req, res) => {
    try {
        let { id } = req.query
        let removeFaq = await FAQs.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    isDeleted: true,
                },
            },
            { new: true }
        )
        if (!removeFaq) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.BAD_REQUEST,
                data: [],
            })
        } else {
            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.FAQ_REMOVED,
                data: [],
            })
        }
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
//#endregion

//#region Active deactive faqs
export const toggleFaqStatus = async (req, res) => {
    try {
        const { id, isActive } = req.query
        // Update the isActive status based on the isActive parameter
        const updatedFaq = await FAQs.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    isActive: isActive === 'true',
                },
            },
            { new: true }
        )

        if (!updatedFaq) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.TOGGLE_NOT,
                data: [],
            })
        } else {
            return res.status(200).json({
                status: StatusCodes.OK,
                message:
                    isActive === 'true'
                        ? ResponseMessage.FAQ_ACTIVATED
                        : ResponseMessage.FAQ_DEACTIVATED,
                data: updatedFaq,
            })
        }
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}

//#endregion

//#region getFaqList

export const getFaqList = async (req, res) => {
    try {
        const data = await FAQs.find({ isDeleted: false })
            .select('question answer  isActive')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.FAQ_LIST,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
export const getFaqListUserSide = async (req, res) => {
    try {
        const data = await FAQs.find({ isDeleted: false, isActive: true })
            .select('question answer  isActive')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.FAQ_LIST,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
//#endregion

//#region addeditspecilization

export const addEditSpecialization = async (req, res) => {
    try {
        let { specializationName, id } = req.body
        if (id) {
            let editSpecialization = await Specialization.findByIdAndUpdate(
                { _id: id },
                { $set: { specializationName } }
            )

            if (editSpecialization) {
                return res.status(200).json({
                    status: StatusCodes.OK,
                    message: ResponseMessage.SPECIALIZATION_UPDATED,
                    data: editSpecialization,
                })
            }
        } else {
            let addSpecialization = await new Specialization({
                specializationName,
            }).save()
            if (addSpecialization) {
                return res.status(201).json({
                    status: StatusCodes.CREATED,
                    message: ResponseMessage.SPECIALIZATION_ADDED,
                    data: addSpecialization,
                })
            }

            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.BAD_REQUEST,
                data: [],
            })
        }
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}

export const getAllSpecialization = async (req, res) => {
    try {
        const data = await Specialization.find({ isDeleted: false })
            .select('specializationName')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.SPECIALIZATION_LIST,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
export const getsingleSpecialization = async (req, res) => {
    try {
        let { id } = req.query
        const data = await Specialization.findById({ _id: id })
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.SPECIALIZATION_FETCHED,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
export const removeSpecialization = async (req, res) => {
    try {
        let { id } = req.query
        let removeSpecialization = await Specialization.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    isDeleted: true,
                },
            },
            { new: true }
        )
        if (!removeSpecialization) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.BAD_REQUEST,
                data: [],
            })
        } else {
            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.SPECIALIZATION_REMOVED,
                data: [],
            })
        }
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}

export const adminSettings = async (req, res) => {
    try {
        const data = await Settings.findOneAndUpdate({}, req.body, {
            new: true,
            upsert: true,
        })

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.SETTINGS_FETCHED,
            data,
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}
export const getSettings = async (req, res) => {
    try {
        const data = await Settings.findOne({})
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.SETTINGS_FETCHED,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}

// export const adminDashboard = async (req, res) => {
//     try {
//         const listOfBookings = await Booking.find({
//             isDeleted: false,
//         }).populate({ path: 'expertId userId', select: 'name' })
//         const listOfBookingsCancelled = await Booking.find({
//             isDeleted: false,
//             status: 'cancelled',
//         })
//         const listOfBookingsCompleted = await Booking.find({
//             isDeleted: false,
//             $or: [{ status: 'completed' }, { orderStatus: 'Confirmed' }],
//         })
//         const listOfExperts = await Expert.find({ isDeleted: false })
//         const listOfOrders = await PlaceOrder.find({})

//         // Calculate Total Revenue based on completed bookings
//         const totalRevenue = listOfBookingsCompleted.reduce(
//             (totalAmount, booking) => {
//                 if (booking.amount && booking.quotationTotalAmount) {
//                     if (booking.quotationTotalAmount) {
//                         return (
//                             totalAmount +
//                             booking.quotationTotalAmount +
//                             booking.amount
//                         )
//                     } else {
//                         return totalAmount + booking.amount
//                     }
//                 } else {
//                     return totalAmount
//                 }
//             },
//             0
//         )

//         // Calculate total number of orders
//         const totalOrders = listOfOrders.length

//         // Fetch top 10 upcoming delivery dates
//         const bookings = await Booking.find({
//             isDeleted: false,
//             status: 'approve',
//         }).populate({ path: 'expertId userId', select: 'name' })
//         const upcomingDeliveries = bookings
//             .filter((booking) =>
//                 moment(booking.bookingDateTime).isAfter(moment())
//             )
//             .sort((a, b) =>
//                 moment(a.bookingDateTime).diff(moment(b.bookingDateTime))
//             )
//             .slice(0, 10)

//             .map((booking) => ({
//                 bookingId_obj: booking._id,
//                 bookingId: booking.bookingId,
//                 userName: booking.userId.name,
//                 // userName: booking.userId ? booking.userId.name : 'Unknown',
//                 bookingDateTime: moment(booking.bookingDateTime).format(
//                     'DD/MM/YYYY hh:mm A'
//                 ),
//             }))

//         // Count the number of completed bookings for each expert
//         const bookingCountMap = {}
//         listOfBookingsCompleted.forEach((booking) => {
//             if (!bookingCountMap[booking.expertId]) {
//                 bookingCountMap[booking.expertId] = 0
//             }
//             bookingCountMap[booking.expertId]++
//         })

//         // Count the number of orders for each expert
//         const orderCountMap = {}
//         listOfOrders.forEach((order) => {
//             if (!orderCountMap[order.expertId]) {
//                 orderCountMap[order.expertId] = 0
//             }
//             orderCountMap[order.expertId]++
//         })

//         // Combine the booking and order counts to find the top consultants
//         const consultantsWithCounts = listOfExperts.map((expert) => ({
//             _id: expert._id,
//             image: expert.image,
//             name: expert.name,
//             bookingsCompleted: bookingCountMap[expert._id] || 0,
//             ordersCompleted: orderCountMap[expert._id] || 0,
//             totalCompleted:
//                 (bookingCountMap[expert._id] || 0) +
//                 (orderCountMap[expert._id] || 0),
//         }))

//         const filteredConsultants = consultantsWithCounts.filter(
//             (expert) => expert.totalCompleted > 0
//         )

//         // Fetch top 5 consultants based on completed bookings and orders
//         const topConsultants = filteredConsultants
//             .sort((a, b) => b.totalCompleted - a.totalCompleted)
//             .slice(0, 5)
//             .map((expert) => ({
//                 _id: expert._id,
//                 image: expert.image,
//                 name: expert.name,
//                 bookingsCompleted: expert.bookingsCompleted,
//                 ordersCompleted: expert.ordersCompleted,
//                 totalCompleted: expert.totalCompleted,
//             }))

//         return res.status(200).json({
//             status: StatusCodes.OK,
//             message: ResponseMessage.DASHBOARD_FETCHED,
//             data: {
//                 totalBookings: listOfBookings.length,
//                 totalBookingsCancelled: listOfBookingsCancelled.length,
//                 totalBookingCompleted: listOfBookingsCompleted.length,
//                 totalRevenue,
//                 totalDeliveries: listOfBookingsCompleted.length,
//                 totalConsultants: listOfExperts.length,
//                 totalOrders,
//                 upcomingDeliveries,
//                 topConsultants,
//             },
//         })
//     } catch (err) {
//         console.log(err)
//         return handleErrorResponse(res, err)
//     }
// }

export const adminDashboard = async (req, res) => {
    try {
        // Aggregation pipeline for bookings
        const [results] = await Booking.aggregate([
            {
                $facet: {
                    allBookings: [
                        { $match: { isDeleted: false } },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'userId',
                                foreignField: '_id',
                                as: 'user',
                            },
                        },
                        {
                            $lookup: {
                                from: 'experts',
                                localField: 'expertId',
                                foreignField: '_id',
                                as: 'expert',
                            },
                        },
                        { $unwind: '$user' },
                        { $unwind: '$expert' },
                    ],
                    cancelledBookings: [
                        { $match: { isDeleted: false, status: 'cancelled' } },
                    ],
                    completedBookings: [
                        {
                            $match: {
                                isDeleted: false,
                                $or: [
                                    { status: 'completed' },
                                    { orderStatus: 'Confirmed' },
                                ],
                            },
                        },
                    ],
                    upcomingBookings: [
                        { $match: { isDeleted: false, status: 'approve' } },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'userId',
                                foreignField: '_id',
                                as: 'user',
                            },
                        },
                        {
                            $lookup: {
                                from: 'experts',
                                localField: 'expertId',
                                foreignField: '_id',
                                as: 'expert',
                            },
                        },
                        { $unwind: '$user' },
                        { $unwind: '$expert' },
                    ],
                },
            },
        ])

        const {
            allBookings: listOfBookings,
            cancelledBookings: listOfBookingsCancelled,
            completedBookings: listOfBookingsCompleted,
            upcomingBookings,
        } = results

        // Calculate Total Revenue based on completed bookings
        const totalRevenue = listOfBookingsCompleted.reduce(
            (total, booking) =>
                total +
                (booking.quotationTotalAmount || 0) +
                (booking.amount || 0),
            0
        )

        // Fetch list of experts and orders
        const [listOfExperts, listOfOrders] = await Promise.all([
            Expert.find({ isDeleted: false }),
            PlaceOrder.find({}),
        ])

        // Calculate total number of orders
        const totalOrders = listOfOrders.length

        // Process upcoming deliveries
        const upcomingDeliveries = upcomingBookings
            .filter((booking) =>
                moment(booking.bookingDateTime).isAfter(moment())
            )
            .sort((a, b) =>
                moment(a.bookingDateTime).diff(moment(b.bookingDateTime))
            )
            .slice(0, 10)
            .map((booking) => ({
                bookingId_obj: booking._id,
                bookingId: booking.bookingId,
                userName: booking.user.name || 'Unknown',
                bookingDateTime: moment(booking.bookingDateTime).format(
                    'DD/MM/YYYY hh:mm A'
                ),
            }))

        // Count completed bookings and orders for each expert
        const bookingCountMap = listOfBookingsCompleted.reduce(
            (map, booking) => {
                map[booking.expertId] = (map[booking.expertId] || 0) + 1
                return map
            },
            {}
        )

        const orderCountMap = listOfOrders.reduce((map, order) => {
            map[order.expertId] = (map[order.expertId] || 0) + 1
            return map
        }, {})

        // Combine the booking and order counts to find the top consultants
        const consultantsWithCounts = listOfExperts.map((expert) => ({
            _id: expert._id,
            image: expert.image,
            name: expert.name,
            bookingsCompleted: bookingCountMap[expert._id] || 0,
            ordersCompleted: orderCountMap[expert._id] || 0,
            totalCompleted:
                (bookingCountMap[expert._id] || 0) +
                (orderCountMap[expert._id] || 0),
        }))

        const filteredConsultants = consultantsWithCounts.filter(
            (expert) => expert.totalCompleted > 0
        )

        // Fetch top 5 consultants based on completed bookings and orders
        const topConsultants = filteredConsultants
            .sort((a, b) => b.totalCompleted - a.totalCompleted)
            .slice(0, 5)
            .map((expert) => ({
                _id: expert._id,
                image: expert.image,
                name: expert.name,
                bookingsCompleted: expert.bookingsCompleted,
                ordersCompleted: expert.ordersCompleted,
                totalCompleted: expert.totalCompleted,
            }))

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.DASHBOARD_FETCHED,
            data: {
                totalBookings: listOfBookings.length,
                totalBookingsCancelled: listOfBookingsCancelled.length,
                totalBookingCompleted: listOfBookingsCompleted.length,
                totalRevenue,
                totalDeliveries: listOfBookingsCompleted.length,
                totalConsultants: listOfExperts.length,
                totalOrders,
                upcomingDeliveries,
                topConsultants,
            },
        })
    } catch (err) {
        console.error(err)
        return handleErrorResponse(res, err)
    }
}
