// import bcrypt from 'bcryptjs'
// import * as geolib from 'geolib'
import StatusCodes from 'http-status-codes'
import ContactUs from '../../models/ContactUs.js'
import Expert from '../../models/Expert.js'
import User from '../../models/User.js'
import {
    encryptPassword,
    generatePassword,
    //generatePassword,
    generateToken,
    handleErrorResponse,
    // parseQueryParameters,
} from '../../services/CommonService.js'
import {
    emailContactUs,
    // sendVerificationEmail,
    sendVerificationEmailOTP,
} from '../../services/EmailServices.js'

// import WishListProduct from '../../models/WishListProduct.js'

import { ResponseMessage } from '../../utils/ResponseMessage.js'

//#region register User
export const registerUser = async (req, res) => {
    let { name, phoneNumber } = req.body //password,
    let email = req.body.email.toLowerCase()
    try {
        const existingUser =
            (await User.findOne({
                $or: [{ email }, { phoneNumber }],
                isDeleted: false,
            })) ||
            (await Expert.findOne({
                $or: [{ email }, { phoneNumber }],
                isDeleted: false,
            }))

        // if (!existingUser) {
        //     existingUser = await Expert.findOne({
        //         $or: [{ email }, { phoneNumber }],
        //         isDeleted: false,
        //     })
        // }
        if (existingUser) {
            const message =
                existingUser.email === email
                    ? ResponseMessage.USER_EMAIL_ALREADY_REGISTERED
                    : ResponseMessage.PHONE_NO_ALREADY_REGISTERED
            return res.status(StatusCodes.CONFLICT).json({
                status: StatusCodes.CONFLICT,
                message,
            })
        }
        // if (existingUser) {
        //     if (existingUser.email === email) {
        //         return res.status(409).json({
        //             status: StatusCodes.CONFLICT,
        //             message: ResponseMessage.USER_EMAIL_ALREADY_REGISTERED,
        //         })
        //     } else {
        //         return res.status(409).json({
        //             status: StatusCodes.CONFLICT,
        //             message: ResponseMessage.PHONE_NO_ALREADY_REGISTERED,
        //         })
        //     }
        // }

        const userData = {
            name,
            email,
            phoneNumber,
        }
        // if (password) {
        //     await sendVerificationEmail(email, password)

        //     const encryptedPassword = await encryptPassword(password)
        //     userData.password = encryptedPassword
        // }
        const otp = 4444
        const otpExpiryTime = new Date(Date.now() + 33 * 1000).getTime()

        // let passwordnew = generatePassword()

        // await sendVerificationEmail(userData.email, passwordnew)

        // const encryptedPassword = await encryptPassword(passwordnew)
        // userData.password = encryptedPassword

        userData.otp = otp
        userData.otpExpire = otpExpiryTime

        const user = await User.create(userData)
        await sendVerificationEmailOTP(email, otp)
        return res.status(201).json({
            status: StatusCodes.CREATED,
            message: ResponseMessage.USER_REGISTERED,
            data: { user_id: user._id },
        })
    } catch (err) {
        console.log(err)
        return handleErrorResponse(res, err)
    }
}
//#endregion

//#region Verify OTP
export const otpGenerate = async (req, res) => {
    try {
        const { emailOrphonenumber, otpType,userType } = req.body

        let email = emailOrphonenumber.toLowerCase()

        let findExpert, findUser

        // Check if the user exists either by email or phone number

        findExpert = await Expert.findOne({
            $or: [{ email: email }, { phoneNumber: emailOrphonenumber }],
            isDeleted: false,
            isActive: true,
            userType: userType,
        })

        findUser = await User.findOne({
            $or: [{ email: email }, { phoneNumber: emailOrphonenumber }],
            isDeleted: false,
            isActive: true,
            userType: userType,
        })

        // If user not found, return an error response
        if (!findExpert && !findUser) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.NOT_FOUND,
                data: [],
            })
        }

        // if (!findUser.isverified === true) {
        //     return res.status(400).json({
        //         status: StatusCodes.BAD_REQUEST,
        //         message: 'Please verify your account first.',
        //         data: [],
        //     })

        // }

        // Check if OTP type is 'resend'
        if (otpType === 'resend') {
            // Check if Expert is being used
            const userToCheck = findExpert || findUser

            // Check if OTP count is less than 3 and 30 minutes have passed since last OTP attempt
            if (
                userToCheck.otpCount &&
                userToCheck.otpCount >= 3 &&
                Date.now() - userToCheck.otpExpire < 5 * 60 * 1000
            ) {
                // If it's less than 30 minutes, block the user
                return res.status(400).json({
                    status: StatusCodes.BAD_REQUEST,
                    message: 'Please wait for 30 minutes before resending OTP',
                    data: [],
                })
            }

            // Reset or increment OTP count
            // let updateQuery = {}
            // if (userToCheck.otpCount && userToCheck.otpCount >= 3) {
            //     // If 30 minutes have passed, reset OTP count
            //     updateQuery = {
            //         $set: { otpCount: 0 },
            //         // otpExpire: Date.now(),
            //     }
            // } else {
            //     // Increment OTP count
            //     updateQuery = {
            //         $inc: { otpCount: 1 },
            //         // otpExpire: Date.now(),
            //     }
            // }

            const updateQuery =
                userToCheck.otpCount && userToCheck.otpCount >= 3
                    ? { $set: { otpCount: 0 } }
                    : { $inc: { otpCount: 1 } }

            // Generate new OTP

            // Generate new OTP
            const otp = 4444
            const otpExpiryTime = new Date().getTime() + 30 * 1000

            // Determine which model to use for updating based on whether findExpert is defined
            const modelToUpdate = findExpert ? Expert : User

            const mergedSet = {
                ...updateQuery.$set,
                otp,
                otpExpire: otpExpiryTime,
            }

            // Remove $set key from updateQuery
            delete updateQuery.$set

            // Merge updateQuery with updated $set
            const finalUpdateQuery = { ...updateQuery, $set: mergedSet }

            // Update the user with new OTP and expiry time
            const updateOTP = await modelToUpdate.findByIdAndUpdate(
                (findExpert || findUser)._id,
                // { ...updateQuery, $set: { otp, otpExpire: otpExpiryTime } },
                finalUpdateQuery,
                { new: true }
            )

            // If update failed, return an error response
            if (!updateOTP) {
                return res.status(400).json({
                    status: StatusCodes.BAD_REQUEST,
                    message: ResponseMessage.UPDATE_FAILED,
                    data: [],
                })
            }

            await sendVerificationEmailOTP((findExpert || findUser).email, otp)

            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.SENT_OTP,
                data: { id: updateOTP },
            })
        } else {
            const modelToUpdate = findExpert ? Expert : User
            const userToCheck = findExpert || findUser

            if (
                userToCheck.otpCount &&
                userToCheck.otpCount >= 3 &&
                Date.now() - userToCheck.otpExpire < 5 * 60 * 1000
            ) {
                return res.status(400).json({
                    status: StatusCodes.BAD_REQUEST,
                    message: 'Please wait for 30 minutes before resending OTP',
                    data: [],
                })
            }

            const otp = 4444
            const otpExpiryTime = new Date().getTime() + 50 * 1000

            const updateOTP = await modelToUpdate.findByIdAndUpdate(
                (findExpert || findUser)._id,
                { $set: { otp, otpCount: 0, otpExpire: otpExpiryTime } },
                { new: true }
            )
            if (!updateOTP) {
                return res.status(400).json({
                    status: StatusCodes.BAD_REQUEST,
                    message: ResponseMessage.UPDATE_FAILED,
                    data: [],
                })
            }

            await sendVerificationEmailOTP((findExpert || findUser).email, otp)

            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.SENT_OTP,
                data: { id: updateOTP },
            })
        }
    } catch (err) {
        console.log(err)

        return handleErrorResponse(res, err)
    }
}

//#region Login User

export const login = async (req, res) => {
    try {
        let findUserOrExpert
        let userType

        if (
            req.body.loginType === 'google' ||
            req.body.loginType === 'facebook'
        ) {
            findUserOrExpert = await User.findOne({
                email: req.body.email,
                isDeleted: false,
                isActive: true,
                userType:"user"
            })

            if (!findUserOrExpert) {
                const newUser = new User({ ...req.body })
                findUserOrExpert = await newUser.save()
            } else if (findUserOrExpert.loginType !== req.body.loginType) {
                return res.status(401).json({
                    status: StatusCodes.UNAUTHORIZED,
                    message:
                        ResponseMessage.EMAIL_REGISTERED_WITH_OTHER_SOCIAL_PLATFORM,
                })
            }

            userType = 'user'
        } else {
            const {emailOrphonenumber, otp } = req.body

            findUserOrExpert = await User.findOne({
                $or: [
                    { email: emailOrphonenumber.toLowerCase() },
                    { phoneNumber: emailOrphonenumber },
                ],
                isDeleted: false,
                isActive: true,
                userType:"user"
            })

            if (!findUserOrExpert) {
                findUserOrExpert = await Expert.findOne({
                    $or: [
                        { email: emailOrphonenumber.toLowerCase() },
                        { phoneNumber: emailOrphonenumber },
                    ],
                    isDeleted: false,
                    isActive: true,
                    userType:"expert"
                })
                userType = findUserOrExpert ? 'expert' : null
            } else {
                userType = 'user'
            }

            if (!findUserOrExpert) {
                return res.status(404).json({
                    status: StatusCodes.NOT_FOUND,
                    message: ResponseMessage.NOT_FOUND,
                })
            }

            if (findUserOrExpert.otpExpire < new Date().getTime()) {
                return res.status(401).json({
                    status: StatusCodes.UNAUTHORIZED,
                    message: ResponseMessage.OTP_EXPIRED,
                })
            }

            if (otp !== findUserOrExpert.otp) {
                return res.status(401).json({
                    status: StatusCodes.UNAUTHORIZED,
                    message: ResponseMessage.INVALID_OTP,
                })
            }

            if (findUserOrExpert.otpExpire < new Date().getTime()) {
                return res.status(401).json({
                    status: StatusCodes.UNAUTHORIZED,
                    message: ResponseMessage.OTP_EXPIRED,
                })
            }

            await (userType === 'user' ? User : Expert).findByIdAndUpdate(
                findUserOrExpert._id,
                { $set: { otp: null, otpExpire: null } }
            )
        }

        // if (!req.body.password && !req.body.otp) {
        //     return res.status(400).json({
        //         status: StatusCodes.BAD_REQUEST,
        //         message: ResponseMessage.INVALID_INPUT,
        //     })
        // }

        const payload = { [`${userType}Id`]: { id: findUserOrExpert._id } }
        const token = await generateToken({ payload, ExpiratioTime: '1h' })

        await (userType === 'user' ? User : Expert).updateOne(
            { _id: findUserOrExpert._id },
            { $set: { token } }
        )

        const loginUserOrExpert = await (
            userType === 'user' ? User : Expert
        ).findOne(
            { _id: findUserOrExpert._id },
            userType === 'user'
                ? { name: 1, email: 1, phoneNumber: 1, image: 1 }
                : {
                      name: 1,
                      email: 1,
                      phoneNumber: 1,
                      image: 1,
                      address: 1,
                      city: 1,
                      state: 1,
                      country: 1,
                      zipCode: 1,
                      qulifications: 1,
                      latitude: 1,
                      longitude: 1,
                      experience: 1,
                      designImage: 1,
                      specialization: 1,
                      averageRating: 1,
                  }
        )

        return res.status(200).json({
            status: StatusCodes.OK,
            message:
                userType === 'user'
                    ? ResponseMessage.USER_LOGGEDIN
                    : ResponseMessage.EXPERT_LOGGEDIN,
            data: { ...loginUserOrExpert.toJSON(), token, userType }, //.toJSON()
        })
    } catch (err) {
        console.error(err)
        return handleErrorResponse(res, err)
    }
}

//# Update fcm token

export const updateFCMToken = async (req, res) => {
    try {
        const { fcmToken } = req.body
        const id = req.user

        const user = await User.findByIdAndUpdate(
            { _id: id },
            { $set: { fcmToken } },
            { new: true }
        )
        if (!user) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.BAD_REQUEST,
                data: [],
            })
        }
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.FCM_TOKEN_UPDATED,
            data: user,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}

//#endregion
//#region removeAdmin
export const removeUser = async (req, res) => {
    try {
        let { id } = req.query
        let removeUser = await User.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    isDeleted: true,
                },
            },
            { new: true }
        )
        if (!removeUser) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.BAD_REQUEST,
                data: [],
            })
        } else {
            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.USER_REMOVED,
                data: [],
            })
        }
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
//#endregion
// #region ProfileEdit
export const profileEdit = async (req, res) => {
    try {
        const userId = req.user

        const { email, phoneNumber } = req.body

        const existingObject = await User.findOne({ _id: userId })

        // const userWithEmail = await User.findOne({
        //     email: req.body.email,
        //     _id: { $ne: userId },
        // })
        // const userWithPhoneNumber = await User.findOne({
        //     phoneNumber: req.body.phoneNumber,
        //     _id: { $ne: userId },
        // })

        // if (userWithEmail) {
        //     return res.status(409).json({
        //         status: StatusCodes.CONFLICT,
        //         message: ResponseMessage.USER_EMAIL_ALREADY_EXIST,
        //     })
        // }

        // if (userWithPhoneNumber) {
        //     return res.status(409).json({
        //         status: StatusCodes.CONFLICT,
        //         message: ResponseMessage.PHONE_NO_ALREADY_EXIST,
        //     })
        // }

        const queryConditions = []
        if (email) {
            queryConditions.push({ email, _id: { $ne: userId } })
        }
        if (phoneNumber) {
            queryConditions.push({ phoneNumber, _id: { $ne: userId } })
        }

        if (queryConditions.length > 0) {
            const conflictingUsers = await User.find({
                $or: queryConditions,
                isDeleted: false,
            })

            const emailConflict = conflictingUsers.find(
                (user) => user.email === email
            )
            if (emailConflict) {
                return res.status(409).json({
                    status: StatusCodes.CONFLICT,
                    message: ResponseMessage.USER_EMAIL_ALREADY_EXIST,
                })
            }

            const phoneConflict = conflictingUsers.find(
                (user) => user.phoneNumber === phoneNumber
            )
            if (phoneConflict) {
                return res.status(409).json({
                    status: StatusCodes.CONFLICT,
                    message: ResponseMessage.PHONE_NO_ALREADY_EXIST,
                })
            }
        }

        // Proceed with whatever action is needed if both email and phoneNumber are unique

        if (req.file) {
            req.body.image = req.file.filename
        }

        if (
            existingObject.email !== req.body.email ||
            existingObject.phoneNumber !== req.body.phoneNumber
        ) {
            const otp = 4444
            const otpExpiryTime = new Date(Date.now() + 33 * 1000).getTime()

            const userOTP = await User.findByIdAndUpdate(
                { _id: userId },
                {
                    $set: {
                        otp,
                        otpExpire: otpExpiryTime,
                        image:
                            req.body.image !== null && req.body.image !== ''
                                ? req.body.image
                                : existingObject.image,
                    },
                },
                { new: true }
            )

            await sendVerificationEmailOTP(existingObject.email, otp)
            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.OTP_SENT,
                data: {
                    id: userOTP._id,
                    ...req.body,
                    otp,
                    otpExpiryTime,
                    image: userOTP.image,
                    loginType: userOTP.loginType,
                    userType: userOTP.userType,
                    fcmToken: userOTP.fcmToken,
                    token: userOTP.token,
                },
                isVerified: false,
                verifiedField:
                    existingObject.email !== req.body.email
                        ? 'email'
                        : existingObject.phoneNumber !== req.body.phoneNumber
                          ? 'phoneNumber'
                          : null,
            })
        } else {
            const updatedUser = await User.findOneAndUpdate(
                { _id: userId },
                { $set: { ...req.body } },
                { new: true }
            )

            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.PROFILE_UPDATED,
                data: updatedUser,
            })
        }

        // Update user's profile
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}

//#endregion

//#region contactUs
export const contactUs = async (req, res) => {
    try {
        const { userNanme, email, phoneNumber, message } = req.body

        const existingContact = await ContactUs.findOne({
            $or: [{ email }, { phoneNumber }],
        })

        if (existingContact) {
            let errorMessage = ''
            if (
                existingContact.email == email &&
                existingContact.phoneNumber == phoneNumber
            ) {
                errorMessage = ResponseMessage.EMAIL_MOBILE_EXIST_BOTH
            } else {
                errorMessage =
                    existingContact.email == email
                        ? ResponseMessage.EMAIL_EXIST
                        : ResponseMessage.MOBILE_EXIST
            }
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: errorMessage,
                data: [],
            })
        }

        if (email) {
            await emailContactUs(email)
        }
        const contactUsData = await new ContactUs({
            userNanme,
            email,
            phoneNumber,
            message,
        }).save()

        return res.status(201).json({
            status: StatusCodes.CREATED,
            message: ResponseMessage.YOUR_REQ_SENT,
            data: contactUsData,
        })
    } catch (error) {
        return res.status(500).json({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ResponseMessage.INTERNAL_SERVER_ERROR,
        })
    }
}

//#end region
//#region getUserList

export const getUserList = async (req, res) => {
    try {
        const data = await User.find({ isDeleted: false }).sort({
            createdAt: -1,
        })

        return res.status(200).json({
            message: ResponseMessage.USER_ALL_LIST,
            data,
        })
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}

//#endregion

//#region getSingleUserList
export const getSingleUser = async (req, res) => {
    try {
        const data = await User.findById(req.query.id)
        return res.status(200).json({
            message: ResponseMessage.USER_SINGLE_LIST,
            data,
        })
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}
//#endregion
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.query.id,
            { isDeleted: true },
            { new: true }
        )

        if (!user) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.USER_NOT_FOUND,
            })
        }

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.USER_DELETED,
            data: user,
        })
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}

//#endregion Add Edit User
export const addEditUser = async (req, res) => {
    try {
        const { id, email, phoneNumber } = req.body

        // Handle image upload
        let image = req.body.image || ''
        if (req.file) {
            image = req.file.filename
        }

        // Check if email or phone number already exists
        let existingUser = await User.findOne({
            $or: [{ email }, { phoneNumber }],
            _id: { $ne: id },
            isDeleted: false,
        })

        if (!existingUser) {
            existingUser = await Expert.findOne({
                $or: [{ email }, { phoneNumber }],
                _id: { $ne: id },
                isDeleted: false,
            })
        }

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(409).json({
                    status: StatusCodes.CONFLICT,
                    message: ResponseMessage.USER_EMAIL_ALREADY_EXIST,
                })
            } else {
                return res.status(409).json({
                    status: StatusCodes.CONFLICT,
                    message: ResponseMessage.PHONE_NO_ALREADY_EXIST,
                })
            }
        }

        //         const queryConditions = []
        //         if (email) {
        //             queryConditions.push({ email, _id: { $ne: id } })
        //         }
        //         if (phoneNumber) {
        //             queryConditions.push({ phoneNumber, _id: { $ne: id } })
        //         }

        //         if (queryConditions.length > 0) {
        //             let conflictingUsers
        //             conflictingUsers = await User.find({
        //                 $or: queryConditions,
        //             })
        // console.log(conflictingUsers);
        //             conflictingUsers = await Expert.find({
        //                 $or: queryConditions,
        //             })

        //             const emailConflict = conflictingUsers.find(
        //                 (user) => user.email === email
        //             )

        //             if (emailConflict) {
        //                 return res.status(409).json({
        //                     status: StatusCodes.CONFLICT,
        //                     message: ResponseMessage.USER_EMAIL_ALREADY_EXIST,
        //                 })
        //             }

        //             const phoneConflict = conflictingUsers.find(
        //                 (user) => user.phoneNumber === phoneNumber
        //             )
        // console.log(phoneConflict);
        //             if (phoneConflict) {
        //                 return res.status(409).json({
        //                     status: StatusCodes.CONFLICT,
        //                     message: ResponseMessage.PHONE_NO_ALREADY_EXIST,
        //                 })
        //             }
        //         }

        const userData = {
            image: image,
            ...req.body,
        }

        if (id) {
            const updatedUser = await User.findOneAndUpdate(
                { _id: id },
                { $set: userData },
                { new: true }
            )

            if (updatedUser) {
                return res.status(200).json({
                    status: StatusCodes.OK,
                    message: ResponseMessage.USER_UPDATED,
                    data: updatedUser,
                })
            }
        } else {
            const encryptedPassword = await encryptPassword(generatePassword())

            const newUser = new User({
                ...userData,
                password: encryptedPassword,
            })

            await newUser.save()

            return res.status(201).json({
                status: StatusCodes.CREATED,
                message: ResponseMessage.USER_CREATED,
                data: newUser,
            })
        }
    } catch (err) {
        console.error(err)
        return handleErrorResponse(res, err)
    }
}
//#endregion

//#region toggle User Active Deative Status
export const userActiveDeactiveStatus = async (req, res) => {
    try {
        const { id } = req.body
        const user = await User.findOne({ _id: id })

        if (!user) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.USER_NOT_FOUND,
            })
        } else {
            // Toggle active status
            const newActiveStatus = !user.isActive

            const updatedUserStatus = await User.updateOne(
                { _id: id },
                { $set: { isActive: newActiveStatus } },
                { new: true }
            )

            return res.status(200).json({
                status: StatusCodes.OK,
                message: !newActiveStatus
                    ? ResponseMessage.USER_DEACTIVE
                    : ResponseMessage.USER_ACTIVE,
                data: updatedUserStatus,
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ResponseMessage.INTERNAL_SERVER_ERROR,
        })
    }
}
//#endregion

//#region Verify OTP

export const verifyOtp = async (req, res) => {
    try {
        // const { otp, id } = req.body

        let findUserOrExpert =
            (await Expert.findOne({ _id: req.body.id, isDeleted: false })) ||
            (await User.findOne({ _id: req.body.id, isDeleted: false }))

        if (findUserOrExpert.otp !== req.body.otp) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.INVALID_OTP,
                data: [],
            })
        }

        const singleFile = req.files['image'] ? req.files['image'][0] : null
        const multipleFiles = req.files['design']
            ? req.files['design'].map((e) => e.filename)
            : []

        if (singleFile) {
            req.body.image = singleFile
        }
        if (multipleFiles) {
            req.body.design = multipleFiles
        }

        if (findUserOrExpert.otpExpire < new Date().getTime()) {
            return res.status(401).json({
                status: StatusCodes.UNAUTHORIZED,
                message: ResponseMessage.OTP_EXPIRED,
            })
        }

        const Model = findUserOrExpert instanceof User ? User : Expert
        const userUpdate = await Model.findByIdAndUpdate(
            req.body.id,
            {
                $set: {
                    ...req.body,

                    otp: null,
                    otpExpire: null,
                    isVerified: true,
                },
            },
            { new: true }
        )

        res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.VERIFICATION_COMPLETED,
            data: userUpdate,
        })
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}
//#endregion

//#region logout
export const logout = async (req, res) => {
    try {
        const userId = req.user
        const logoutadmin = await User.findByIdAndUpdate(
            {
                _id: userId,
            },
            { $set: { token: null } },
            { new: true }
        )

        return res.status(200).send({
            success: StatusCodes.OK,
            message: ResponseMessage.USER_LOGOUT,
            data: logoutadmin,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
// #endregion

//#region adding a product to the wishlist

// export const addProductWishList = async (req, res) => {
//     const userId = req.user
//     const { productId, serviceProductId } = req.query

//     if (!productId && !serviceProductId) {
//         return res
//             .status(400)
//             .send('You must provide either a productId or a serviceProductId.')
//     }

//     try {
//         const queryConditions = [
//             { userId, productId: productId || undefined },
//             { userId, serviceProductId: serviceProductId || undefined },
//         ].filter(
//             (condition) =>
//                 Object.values(condition).includes(undefined) === false
//         )

//         const existingWishListEntry = await WishListProduct.findOne({
//             $or: queryConditions,
//         })
//         console.log(existingWishListEntry)
//         if (existingWishListEntry) {
//             return res.status(400).send({
//                 success: StatusCodes.BAD_REQUEST,
//                 message: 'This product or service is already in your wishlist.',
//             })
//         }

//         // Create a new wishlist entry
//         const newWishListEntry = new WishListProduct({
//             userId,
//             productId: productId || null,
//             serviceProductId: serviceProductId || null,
//         })

//         await newWishListEntry.save()
//         return res.status(200).send({
//             success: StatusCodes.OK,
//             message: 'Product added to wishlist successfully',
//             data: newWishListEntry,
//         })
//     } catch (error) {
//         console.log(error)
//         return handleErrorResponse(res, error)
//     }
// }

// // #endregion

// //#region listing wishlist products by user id
// export const productListingByUserId = async (req, res) => {
//     try {
//         const userId = req.user
//         const wishListProductsList = await WishListProduct.find({
//             userId: userId,
//         })
//             .sort({ createdAt: -1 })
//             .populate('productId')
//             .populate('serviceProductId')
//             .populate({ path: 'userId', select: 'name email phoneNumber' })
//         if (WishListProduct.length > 0) {
//             return res.status(200).send({
//                 success: StatusCodes.OK,
//                 message: ResponseMessage.PRODUCT_LISTING_BY_USER_ID,
//                 data: wishListProductsList,
//             })
//         } else {
//             return res.status(404).send({
//                 success: StatusCodes.NOT_FOUND,
//                 message: ResponseMessage.NOT_FOUND_PRODUCT_WISHLIST,
//                 data: [],
//             })
//         }
//     } catch (error) {
//         console.log(error)
//         return handleErrorResponse(res, error)
//     }
// }
