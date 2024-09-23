import { PrismaClient } from '@prisma/client';
import { initiatePayment } from '../modules/daraja';

const prisma = new PrismaClient();

export const makePayment = async (req, res) => {
  const { appointmentId, amount, phoneNumber } = req.body;

  try {
    // Ensure the appointment exists
    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Initiate payment using Daraja
    const paymentResponse = await initiatePayment(amount, phoneNumber, `Appointment-${appointmentId}`, `${process.env.BASE_URL}/api/payments/callback`);

    // Record payment in the database with status pending
    const payment = await prisma.payment.create({
      data: {
        appointmentId: appointment.id,
        transactionId: paymentResponse.CheckoutRequestID,  // Store Daraja transaction ID
        amount,
        status: 'PENDING',
      },
    });

    res.status(201).json({ message: 'Payment initiated', payment });
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({ message: 'Error initiating payment' });
  }
};

// Handle Daraja callback to update payment status
export const handlePaymentCallback = async (req, res) => {
  const { Body } = req.body;
  const { ResultCode, CheckoutRequestID } = Body.stkCallback;

  try {
    const payment = await prisma.payment.findUnique({
      where: { transactionId: CheckoutRequestID },
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (ResultCode === 0) {
      // Payment successful
      await prisma.payment.update({
        where: { transactionId: CheckoutRequestID },
        data: { status: 'COMPLETED' },
      });
    } else {
      // Payment failed
      await prisma.payment.update({
        where: { transactionId: CheckoutRequestID },
        data: { status: 'FAILED' },
      });
    }

    res.status(200).json({ message: 'Payment status updated' });
  } catch (error) {
    console.error('Error handling payment callback:', error);
    res.status(500).json({ message: 'Error updating payment status' });
  }
};
