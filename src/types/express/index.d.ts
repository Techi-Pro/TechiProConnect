import { User, Technician } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User | Technician | any;
    }
  }
} 