import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createAppointment = async ({ clientId, technicianId, serviceType, appointmentDate }) => {
  return prisma.appointment.create({
    data: {
      clientId,
      technicianId,
      serviceType,
      appointmentDate: new Date(appointmentDate),
    },
  });
};

export const getAppointmentsByClient = async (clientId) => {
  return prisma.appointment.findMany({
    where: { clientId },
    include: { technician: true },
  });
};

export const getAppointmentsByTechnician = async (technicianId) => {
  return prisma.appointment.findMany({
    where: { technicianId },
    include: { client: true },
  });
};

export const updateAppointment = async (id, { appointmentDate, status }) => {
  return prisma.appointment.update({
    where: { id: parseInt(id) },
    data: {
      appointmentDate: appointmentDate ? new Date(appointmentDate) : undefined,
      status,
    },
  });
};

export const deleteAppointment = async (id) => {
  return prisma.appointment.delete({ where: { id: parseInt(id) } });
}; 