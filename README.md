# TechiProConnect API

A robust, scalable Node.js/Express/TypeScript API for matching clients with technicians, featuring geolocation, real-time messaging, payments, ratings, notifications, and more.

---

## 🚀 Features
- **User & Technician Registration/Login**
- **Role-Based Access Control (RBAC)**
- **Geolocation-based Technician Matching**
- **Admin Verification Flows**
- **Real-Time Messaging (Socket.io + REST history)**
- **Payment Integration (Daraja simulation)**
- **Push Notifications (FCM-ready)**
- **Forgot/Reset Password**
- **Pagination on all list endpoints**
- **Input Validation & Sanitization**
- **Rate Limiting**
- **Comprehensive Testing (Jest)**
- **OpenAPI/Swagger Documentation**

---

## 🛠 Tech Stack
- **Node.js** / **Express** / **TypeScript**
- **Prisma** (PostgreSQL, PostGIS)
- **Socket.io**
- **Jest** (testing)
- **Swagger/OpenAPI**
- **Nodemailer** (email)
- **FCM** (push notifications)

---

## 📦 Setup & Installation

1. **Clone the repo:**
   ```bash
   git clone https://github.com/yourusername/TechiProConnect.git
   cd TechiProConnect
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in required values:
     - `DATABASE_URL`, `JWT_SECRET`, `EMAIL_USERNAME`, `EMAIL_PASSWORD`, `BASE_URL`, etc.
4. **Run database migrations:**
   ```bash
   npx prisma migrate deploy
   # or for local dev
   npx prisma migrate dev
   ```
5. **Start the server:**
   ```bash
   npm run dev
   # or for production
   npm run build && npm start
   ```

---

## 🧪 Running Tests
```bash
npm test
```

---

## 📖 API Documentation
- The full OpenAPI/Swagger spec is in [`openapi.yaml`](./openapi.yaml)
- You can view it locally with [Swagger Editor](https://editor.swagger.io/) or serve it with a Swagger UI tool.

---

## 🚀 Deployment on Render

1. **Push your code to GitHub.**
2. **Create a new Web Service on [Render](https://render.com/):**
   - Connect your GitHub repo.
   - Set the build command: `npm install && npm run build`
   - Set the start command: `npm start`
   - Add environment variables in the Render dashboard (same as your `.env`).
   - (Optional) Add a PostgreSQL database via Render and update `DATABASE_URL`.
3. **Automatic deploys:**
   - Render will build and deploy on every push to your main branch.

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📝 License
[MIT](./LICENSE)

---

## 📬 Contact
- Project Maintainer: [Movine Odhiambo](mailto:movineeer@email.com)
- Issues: [GitHub Issues](https://github.com/Movineo/TechiProConnect/issues) 