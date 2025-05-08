import { PrismaClient } from '@prisma/client';
// import admin from 'firebase-admin';
// import serviceAccount from '../../../firebase-service-account.json';

const prisma = new PrismaClient();

// Uncomment and configure Firebase Admin SDK for real use
// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
// }

export const registerDeviceToken = async (userId, token) => {
  // Upsert device token for user
  return prisma.deviceToken.upsert({
    where: { token },
    update: { userId },
    create: { userId, token },
  });
};

export const sendPushNotification = async ({ token, title, body, data }) => {
  // Uncomment for real FCM
  // return admin.messaging().send({
  //   token,
  //   notification: { title, body },
  //   data,
  // });
  // Simulate notification for now
  return { success: true, token, title, body, data };
}; 