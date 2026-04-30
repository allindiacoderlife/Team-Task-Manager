# Team Task Manager Backend

A robust, secure, and scalable backend for a Team Task Management application. Built with Node.js, Express, and Prisma, utilizing a modular architecture for easy maintenance and expansion.

## 🚀 Features

- **Authentication**: Secure JWT-based auth with OTP verification for logins and password resets.
- **OTP Hashing**: OTPs are hashed before storage for maximum security.
- **Project Management**: Create projects and manage team members with role-based access control (Owner, Admin, Member).
- **Task Management**: Create, assign, and track tasks with status updates and due dates.
- **Dashboard**: Real-time statistics including task status breakdowns and overdue task tracking.
- **Modular Schema**: Utilizes Prisma's split-schema feature for clean model definitions.

## 🛠 Tech Stack

- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **ORM**: Prisma (v7+)
- **Database**: PostgreSQL (Neon.tech)
- **Security**: Bcrypt (Hashing), JSON Web Tokens (Session)
- **Mailing**: Nodemailer (SMTP)

## 📦 Getting Started

### Prerequisites

- Node.js installed on your machine.
- A PostgreSQL database (Neon recommended).

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd Team-Task-Manager/server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=8000
   DATABASE_URL="your-postgresql-url"
   JWT_SECRET="your-secret-key"
   SALT_ROUNDS=12
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   ```

4. **Initialize Database**:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Start the server**:
   ```bash
   npm run dev
   ```

## 🛣 API Reference

### Auth Endpoints
- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Direct password login.
- `POST /api/auth/send-otp`: Request an OTP for login or reset.
- `POST /api/auth/verify-otp`: Verify OTP and get JWT token.
- `POST /api/auth/forgot-password`: Request password reset.
- `POST /api/auth/reset-password`: Reset password using OTP.

### Project Endpoints
- `POST /api/projects`: Create a project.
- `GET /api/projects/my`: List my projects.
- `POST /api/projects/:id/members`: Add member.
- `DELETE /api/projects/:id/members/:userId`: Remove member.

### Task Endpoints
- `POST /api/tasks`: Create a task.
- `PATCH /api/tasks/:id/status`: Update status.
- `GET /api/tasks/my`: Get my assigned tasks.
- `GET /api/tasks/project/:projectId`: Get project tasks.

### Dashboard
- `GET /api/dashboard/stats`: Get overview statistics.

## 📄 License

Distributed under the ISC License. See `LICENSE` for more information.

---
Developed by **Chirag Saxena**
