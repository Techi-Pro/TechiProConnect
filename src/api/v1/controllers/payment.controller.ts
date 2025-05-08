import * as paymentService from '../services/payment.service';

export const makePayment = async (req, res) => {
  try {
    const payment = await paymentService.makePayment(req.body);
    res.status(201).json({ message: 'Payment initiated', payment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const handlePaymentCallback = async (req, res) => {
  try {
    await paymentService.handlePaymentCallback(req.body.Body);
    res.status(200).json({ message: 'Payment status updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const simulateDarajaPayment = async (req, res) => {
  const { appointmentId, amount, phoneNumber } = req.body;
  try {
    if (!appointmentId || !amount || !phoneNumber) {
      return res.status(400).json({ message: 'appointmentId, amount, and phoneNumber are required' });
    }
    const payment = await paymentService.simulateDarajaPayment({ appointmentId, amount, phoneNumber });
    res.status(201).json({ message: 'Payment successful (simulated)', payment });
  } catch (error) {
    console.error('Error simulating Daraja payment:', error);
    res.status(500).json({ message: 'Error simulating Daraja payment' });
  }
};
