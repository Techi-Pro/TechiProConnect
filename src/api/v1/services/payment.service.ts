import { PrismaClient, PaymentStatus } from '@prisma/client';
import { initiatePayment } from '../utils/daraja.util';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const makePayment = async ({ appointmentId, amount, phoneNumber }) => {
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) throw new Error('Appointment not found');
  const paymentResponse = await initiatePayment(amount, phoneNumber, `Appointment-${appointmentId}`, `${process.env.BASE_URL}/api/payments/callback`);
  const payment = await prisma.payment.create({
    data: {
      appointmentId: appointment.id,
      transactionId: paymentResponse.CheckoutRequestID,
      amount,
      status: 'PENDING',
    },
  });
  return payment;
};

export const handlePaymentCallback = async (Body) => {
  const { ResultCode, CheckoutRequestID } = Body.stkCallback;
  const payment = await prisma.payment.findUnique({ where: { transactionId: CheckoutRequestID } });
  if (!payment) throw new Error('Payment not found');
  if (ResultCode === 0) {
    await prisma.payment.update({
      where: { transactionId: CheckoutRequestID },
      data: { status: 'COMPLETED' },
    });
  } else {
    await prisma.payment.update({
      where: { transactionId: CheckoutRequestID },
      data: { status: 'FAILED' },
    });
  }
  return true;
};

export const simulateDarajaPayment = async ({ appointmentId, amount, phoneNumber }) => {
  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Generate a fake transaction ID
  const transactionId = 'DARAJA_' + crypto.randomBytes(8).toString('hex');
  // Store payment record
  const payment = await prisma.payment.create({
    data: {
      appointmentId: parseInt(appointmentId),
      transactionId,
      amount: parseFloat(amount),
      status: PaymentStatus.COMPLETED,
    },
  });
  return payment;
}; 