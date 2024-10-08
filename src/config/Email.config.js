// import nodemailer from 'nodemailer'
import sgMail from '@sendgrid/mail'
import dotenv from 'dotenv'
dotenv.config()

sgMail.setApiKey(process.env.EMAIL_PASSWORD)

export const transporter = sgMail

// export const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//         user: process.env.EMAIL_FROM,
//         pass: process.env.EMAIL_PASSWORD,
//     },
// })
