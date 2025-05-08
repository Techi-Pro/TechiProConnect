import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMessagesByAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try {
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { appointmentId: parseInt(appointmentId) },
        orderBy: { sentAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.message.count({ where: { appointmentId: parseInt(appointmentId) } }),
    ]);
    res.status(200).json({ items: messages, total, page, pageSize: limit });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
}; 