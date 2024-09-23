import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Create an appointment
router.post('/appointments', async (req, res) => {
  const { clientId, technicianId, serviceType, appointmentDate } = req.body;

  try {
    const appointment = await prisma.appointment.create({
      data: {
        clientId,
        technicianId,
        serviceType,
        appointmentDate: new Date(appointmentDate),
      },
    });
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Get appointments for a client
router.get('/appointments/client/:clientId', async (req, res) => {
  const { clientId } = req.params;
  try {
    const appointments = await prisma.appointment.findMany({
      where: { clientId },
      include: { technician: true },
    });
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get appointments for a technician
router.get('/appointments/technician/:technicianId', async (req, res) => {
  const { technicianId } = req.params;
  try {
    const appointments = await prisma.appointment.findMany({
      where: { technicianId },
      include: { client: true },
    });
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Update an appointment (e.g., reschedule or change status)
router.put('/appointments/:id', async (req, res) => {
  const { id } = req.params;
  const { appointmentDate, status } = req.body;
  
  try {
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: {
        appointmentDate: appointmentDate ? new Date(appointmentDate) : undefined,
        status,
      },
    });
    res.status(200).json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Cancel an appointment
router.delete('/appointments/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.appointment.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error canceling appointment:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

export default router;
