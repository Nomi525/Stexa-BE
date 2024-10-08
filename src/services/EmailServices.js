/* eslint-disable no-unused-vars */
import ejs from 'ejs'
import { transporter } from '../config/Email.config.js'
import Admin from '../models/Admin.js'
import dotenv from 'dotenv'
dotenv.config()

// const getEmailDetails = async (referModel, useremail, expertemail) => {
//     // let adminemail = 'admin@stexa.com'
//     let adminemail = 'admin@stexa.com'
//     //     let findAdmin = await Admin.findOne({
//     //         isAdmin:true,
//     //         type:"Admin"
//     //     })
//     // let adminemail = findAdmin ? findAdmin.email : null

//     let fromEmail = process.env.EMAIL_FROM
//     let toEmail
//     let ccEmails
// if (referModel === 'User') {

//    toEmail = useremail;
//    ccEmails = [expertemail, adminemail];

// } else if (referModel === 'expert') {
//   toEmail = expertemail;
//   ccEmails = [useremail, adminemail];
// } else if (referModel === 'admin') {
//     toEmail = adminemail;
//     ccEmails = [useremail, expertemail];
// } else {
//     throw new Error('Invalid referModel type');
// }

// return { fromEmail, toEmail, ccEmails };

// }
const getEmailDetails = (referModel, useremail, expertemail) => {
    let adminemail = 'admin@stexa.com'
    let fromEmail = process.env.EMAIL_FROM
    let toEmail
    let ccEmails

    if (referModel === 'User') {
        toEmail = useremail
        ccEmails = [expertemail, adminemail]
    } else if (referModel === 'expert') {
        toEmail = expertemail
        ccEmails = [useremail, adminemail]
    } else if (referModel === 'admin') {
        toEmail = adminemail
        ccEmails = [useremail, expertemail]
    } else {
        throw new Error('Invalid referModel type')
    }

    return { fromEmail, toEmail, ccEmails }
}

export const sendVerificationEmailOTP = async (email, otp) => {
    const mailInfo = await ejs.renderFile(
        'src/views/EmailOTPVerification.ejs',
        {
            otp: otp,
        }
    )

    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Stexa OTP',
            html: mailInfo,
        }

        transporter.send(mailOptions, (err, info) => {
            if (err) {
                console.error('Error sending email:', err)
                reject(err)
            } else {
                resolve(info)
            }
        })
    })
}

export const sendVerificationEmail = async (email, password) => {
    const mailInfo = `<html>
        <body>
          <p>Hello,</p>
          <p>Your email  is: <strong>${email}  and login password ${password}</strong></p>
          <p>Thank you for using Stexa.</p>
        </body>
      </html>`

    return new Promise((resolve, reject) => {
        const mailing = {
            // from: process.env.SENDGRID_USER_FROM,
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Stexa user credential',
            html: mailInfo,
        }
        transporter.send(mailing, (err, info) => {
            if (err) {
                console.error('Error sending email:', err)
                reject(err)
            } else {
                resolve(info)
            }
        })
    })
}

//#region Contact Us Confirmation mail

export const emailContactUs = async (email) => {
    const mailInfo = `<html>
        <body>
          <p>Hello,</p>
          <p>Thank you for reaching out to us! We sincerely appreciate the time you took to contact us and for your
          interest in Stexa</strong></p>
          <p>We have received your message and are currently reviewing it. Our team will get back to you as soon as
          possible.
          Once again, thank you for choosing Stexa. We look forward to assisting you further.</p>
        </body>
      </html>`

    return new Promise((resolve, reject) => {
        const mailing = {
            // from: process.env.SENDGRID_USER_FROM,
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Stexa inquiry',
            html: mailInfo,
        }
        transporter.send(mailing, (err, info) => {
            if (err) {
                reject(err)
            } else {
                resolve(info)
            }
        })
    })
}

export const emailPartnerUs = async (email) => {
    const mailInfo = await ejs.renderFile('src/views/EmailPartnerWithUs.ejs')
    return new Promise((resolve, reject) => {
        const mailing = {
            // from: process.env.SENDGRID_USER_FROM,
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Partnership Inquiry with Stexa',
            html: mailInfo,
        }
        transporter.send(mailing, (err, info) => {
            if (err) {
                reject(err)
            } else {
                resolve(info)
            }
        })
    })
}
export const emailPartnerUsUpdate = async (email, status, rejectReason) => {
    const mailInfo = await ejs.renderFile(
        'src/views/PartnerWithUsStatusUpdate.ejs',
        {
            status: status,
            rejectReason: rejectReason,
        }
    )
    return new Promise((resolve, reject) => {
        const mailing = {
            // from: process.env.SENDGRID_USER_FROM,
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Partnership Inquiry Upadte with Stexa',
            html: mailInfo,
        }
        transporter.send(mailing, (err, info) => {
            if (err) {
                reject(err)
            } else {
                resolve(info)
            }
        })
    })
}

//#endregion
//#Booking Cancel and Refund
// export const bookingCancelEmail = async (
//     useremail,
//     expertemail,
//     bookingId,
//     status,
//     referModelData
// ) => {
//     const mailInfo = await ejs.renderFile('src/views/bookingCancel.ejs', {
//         bookingId,
//         status,
//     })
//     let { fromEmail, toEmail, ccEmails } = getEmailDetails(
//         referModelData,
//         useremail,
//         expertemail
//     )
//     return new Promise((resolve, reject) => {
//         console.log(ccEmails,"ccEmails")
//         const mailing = {
//             from: fromEmail,
//             to: toEmail,
//             cc: ccEmails.join(','),
//             subject: 'Stexa Booking Cancellation',
//             html: mailInfo,
//         }
//         transporter.send(mailing, (err, info) => {
//             if (err) {
//                 reject(err)
//             } else {
//                 resolve(info)
//             }
//         })
//     })
// }
export const bookingCancelEmail = async (
    useremail,
    expertemail,
    bookingId,
    status,
    referModelData
) => {
    const mailInfo = await ejs.renderFile('src/views/bookingCancel.ejs', {
        bookingId,
        status,
    })

    // Call getEmailDetails synchronously
    let { fromEmail, toEmail, ccEmails } = getEmailDetails(
        referModelData,
        useremail,
        expertemail
    )

    return new Promise((resolve, reject) => {
        const mailing = {
            from: fromEmail,
            to: toEmail,
            cc: ccEmails.join(','),
            subject: 'Stexa Booking Cancellation',
            html: mailInfo,
        }
        transporter.send(mailing, (err, info) => {
            if (err) {
                reject(err)
            } else {
                resolve(info)
            }
        })
    })
}

export const bookingRefundEmail = async (
    useremail,
    expertemail,
    bookingId,
    status,
    referModel
) => {
    const mailInfo = await ejs.renderFile('src/views/bookingRefund.ejs', {
        bookingId,
        status,
    })
    const { fromEmail, toEmail, ccEmails } = getEmailDetails(
        referModel,
        useremail,
        expertemail
    )
    return new Promise((resolve, reject) => {
        const mailing = {
            // from: process.env.SENDGRID_USER_FROM,
            from: fromEmail,
            to: toEmail,
            cc: ccEmails.join(','),
            subject: 'Stexa Booking Refund',
            html: mailInfo,
        }
        transporter.send(mailing, (err, info) => {
            if (err) {
                reject(err)
            } else {
                resolve(info)
            }
        })
    })
}

export const bookingAddEmail = async (useremail, expertemail, bookingId) => {
    const mailInfo = await ejs.renderFile('src/views/bookingCreate.ejs', {
        bookingId,
    })
    let adminemail = 'admin@stexa.com'
    return new Promise((resolve, reject) => {
        const mailing = {
            // from: process.env.SENDGRID_USER_FROM,
            from: process.env.EMAIL_FROM,
            to: useremail,
            cc: adminemail,
            expertemail,
            subject: 'Stexa Booking Confirmation',
            html: mailInfo,
        }
        transporter.send(mailing, (err, info) => {
            if (err) {
                reject(err)
            } else {
                resolve(info)
            }
        })
    })
}

//#endregion
//#Order Cancel and Refund
export const orderCancelEmail = async (
    useremail,
    expertemail,
    orderId,
    status,
    referModel
) => {
    const mailInfo = await ejs.renderFile('src/views/orderCancel.ejs', {
        orderId,
        status,
    })

    let { fromEmail, toEmail, ccEmails } = getEmailDetails(
        referModel,
        useremail,
        expertemail
    )

    return new Promise((resolve, reject) => {
        const mailing = {
            from: process.env.EMAIL_FROM,
            // from: fromEmail,
            to: toEmail,
            cc: ccEmails.join(','),
            subject: 'Stexa Order Cancellation',
            html: mailInfo,
        }
        transporter.send(mailing, (err, info) => {
            if (err) {
                reject(err)
            } else {
                resolve(info)
            }
        })
    })
}
export const orderRefundEmail = async (
    useremail,
    expertemail,
    orderId,
    status,
    referModel
) => {
    const mailInfo = await ejs.renderFile('src/views/orderRefund.ejs', {
        orderId,
        status,
    })

    let { fromEmail, toEmail, ccEmails } = getEmailDetails(
        referModel,
        useremail,
        expertemail
    )

    return new Promise((resolve, reject) => {
        const mailing = {
            from: process.env.EMAIL_FROM,
            // from: fromEmail,
            to: toEmail,
            cc: ccEmails.join(','),
            subject: 'Stexa Order Refund',
            html: mailInfo,
        }
        transporter.send(mailing, (err, info) => {
            if (err) {
                reject(err)
            } else {
                resolve(info)
            }
        })
    })
}
//#endregion

//#order return by user
export const orderReturnEmail = async (myuseremail, myorderId) => {
    const mailInfo = await ejs.renderFile('src/views/orderReturn.ejs', {
        myorderId,
    })
    const findAdmin = await Admin.findOne({
        isAdmin: true,
        type: 'Admin',
    })
    const adminemail = findAdmin ? findAdmin.email : null
    return new Promise((resolve, reject) => {
        const mailing = {
            // from: process.env.SENDGRID_USER_FROM,
            from: process.env.EMAIL_FROM,
            to: myuseremail,
            subject: 'Stexa Order Return Request',
            html: mailInfo,
        }
        transporter.send(mailing, (err, info) => {
            if (err) {
                reject(err)
            } else {
                resolve(info)
            }
        })
    })
}
//#endregion

//#order return status update by admin for user
export const orderReturnStatusUpdateEmail = async (
    myuseremail,
    myorderId,
    status
) => {
    const mailInfo = await ejs.renderFile('src/views/orderRetrunStatus.ejs', {
        myorderId,
        status,
    })
    return new Promise((resolve, reject) => {
        const mailing = {
            // from: process.env.SENDGRID_USER_FROM,
            from: process.env.EMAIL_FROM,
            to: myuseremail,
            subject: 'Stexa Return Order update',
            html: mailInfo,
        }
        transporter.send(mailing, (err, info) => {
            if (err) {
                reject(err)
            } else {
                resolve(info)
            }
        })
    })
}
//#endregion
//#order return status update by admin for expert
export const orderReturnNotifyExpertEmail = async (myorderId, myexpertId) => {
    const mailInfo = await ejs.renderFile(
        'src/views/assigneExpertReturnOrder.ejs',
        {
            myorderId,
        }
    )
    return new Promise((resolve, reject) => {
        const mailing = {
            // from: process.env.SENDGRID_USER_FROM,
            from: process.env.EMAIL_FROM,
            to: myexpertId,
            subject: 'Stexa Return Order Review Request',
            html: mailInfo,
        }
        transporter.send(mailing, (err, info) => {
            if (err) {
                reject(err)
            } else {
                resolve(info)
            }
        })
    })
}
//#endregion

//#order return status update by expert(it sent mail to admin)
export const orderReturnStatusUpdateByExpertEmail = async (
    expertName,
    myorderId,
    myexpertId,
    returnRequestId
) => {
    const mailInfo = await ejs.renderFile(
        'src/views/returnOrderExpertReview.ejs',
        {
            myorderId,
            myexpertId,
            returnRequestId,
            expertName,
        }
    )
    const findAdmin = await Admin.findOne({
        isAdmin: true,
        type: 'Admin',
    })
    const adminemail = findAdmin ? findAdmin.email : null
    return new Promise((resolve, reject) => {
        const mailing = {
            // from: process.env.SENDGRID_USER_FROM,
            from: process.env.EMAIL_FROM,
            to: adminemail,
            subject: 'Stexa ReturnOrder Reviewed Report by Expert',
            html: mailInfo,
        }
        transporter.send(mailing, (err, info) => {
            if (err) {
                reject(err)
            } else {
                resolve(info)
            }
        })
    })
}
//#endregion

//#order return order refund status update by admin for user
export const orderReturnRefundStatusUpdateEmail = async (
    myuseremail,
    myorderId,
    status
) => {
    const mailInfo = await ejs.renderFile('src/views/returnOrderRefund.ejs', {
        myorderId,
        status,
    })
    return new Promise((resolve, reject) => {
        const mailing = {
            // from: process.env.SENDGRID_USER_FROM,
            from: process.env.EMAIL_FROM,
            to: myuseremail,
            subject: 'Stexa ReturnOrder update',
            html: mailInfo,
        }
        transporter.send(mailing, (err, info) => {
            if (err) {
                reject(err)
            } else {
                resolve(info)
            }
        })
    })
}
//#endregion
