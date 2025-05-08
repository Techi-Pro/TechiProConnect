import * as appointmentService from '../services/appointment.service';

export const createAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.createAppointment(req.body);
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAppointmentsByClient = async (req, res) => {
  try {
    const appointments = await appointmentService.getAppointmentsByClient(req.params.clientId);
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAppointmentsByTechnician = async (req, res) => {
  try {
    const appointments = await appointmentService.getAppointmentsByTechnician(req.params.technicianId);
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.updateAppointment(req.params.id, req.body);
    res.status(200).json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    await appointmentService.deleteAppointment(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 