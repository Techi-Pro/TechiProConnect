import axios from 'axios';

const DARAJA_BASE_URL = 'https://sandbox.safaricom.co.ke';  // Use sandbox for testing

// Replace with your actual Daraja consumer key and secret
const consumerKey = process.env.DARAJA_CONSUMER_KEY;
const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;

// Function to get OAuth token from Daraja
export const getDarajaToken = async () => {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const response = await axios.get(`${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  return response.data.access_token;
};

// Function to make STK Push request (payment request)
export const initiatePayment = async (amount: number, phoneNumber: string, accountReference: string, callbackUrl: string) => {
  const token = await getDarajaToken();

  const data = {
    BusinessShortCode: process.env.DARAJA_SHORT_CODE,  // Your short code
    Password: Buffer.from(`${process.env.DARAJA_SHORT_CODE}${process.env.DARAJA_PASSKEY}${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)}`).toString('base64'),
    Timestamp: new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14),
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phoneNumber,  // Client's phone number
    PartyB: process.env.DARAJA_SHORT_CODE,  // Your paybill or till number
    PhoneNumber: phoneNumber,
    CallBackURL: callbackUrl,  // URL to receive payment status updates
    AccountReference: accountReference,  // Appointment ID or service name
    TransactionDesc: 'Payment for services',
  };

  const response = await axios.post(`${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
