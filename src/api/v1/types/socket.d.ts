import { User } from '@prisma/client';  // Import the User type if needed

declare module 'socket.io' {
  interface Socket {
    user?: User | any;  // You can replace `any` with the actual user type if needed
  }
}
