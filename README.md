# Team Task Manager

A full-stack collaborative task management application designed for teams to organize, track, and complete projects efficiently.

## 📁 Project Structure

```text
Team-Task-Manager/
├── client/          # React (Vite) Frontend
└── server/          # Node.js (Express) Backend
```

## ✨ Key Features

- **Project Tracking**: Create projects and manage team memberships.
- **Task Management**: Assign tasks, set due dates, and update statuses in real-time.
- **Secure Auth**: OTP-based login and password recovery with JWT sessions.
- **Admin Dashboard**: Visual overview of team performance and task status.
- **Role-Based Access**: Granular permissions for Project Owners, Admins, and Members.

## 🚀 Quick Start

### 1. Backend Setup (Server)
```bash
cd server
npm install
# Configure your .env file
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 2. Frontend Setup (Client)
```bash
cd client
npm install
# Configure your .env file (VITE_API_URL)
npm run dev
```

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router 7

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma (PostgreSQL / Neon)
- **Security**: JWT & Bcrypt
- **Email**: Nodemailer

## 📝 Prerequisites

- Node.js (v20+)
- PostgreSQL Database
- SMTP Server for OTP emails (Gmail recommended)

## 📄 License

This project is licensed under the ISC License.

---
Developed with ❤️ by **Chirag Saxena**
