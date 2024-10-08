// import admin from 'firebase-admin'
// import { pushnotification as Credential } from '../config/PushNotification.Config.js'

// admin.initializeApp({
//     credential: admin.credential.cert({
//         privateKey: Credential.private_key,
//         clientEmail: Credential.client_email,
//         projectId: Credential.project_id,
//     }),
// })

// const SendPushNotification = async (
//     title,
//     body,
//     fcmToken,
//     notificationType
// ) => {
//     const message = {
//         notification: { title, body },
//         data: {
//             notificationType: notificationType.toString(),
//         },
//     }
//     try {
//         const validUser = fcmToken.filter((e) => e)
//         if (validUser.length) {
//             const notificationResposne = await admin
//                 .messaging()
//                 .sendToDevice(validUser, message)
//             return notificationResposne
//         }
//     } catch (error) {
//         console.log(error)
//         throw error
//     }
// }

// export default SendPushNotification

//#region send user notification
// export const userNotification = async (
//     userId,
//     title,
//     body,
//     notificationId,
//     bookingId
//   ) => {
//     const userToken = await User.findById(userId);
//     if (userToken.fcmToken) {
//       await sendNotification(
//         userToken.fcmToken,
//         title,
//         body,
//         notificationId,
//         bookingId
//       );
//     }
//   };
//#endregion
