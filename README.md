# Team Task Manager

A professional, full-stack collaborative task management application designed for teams to organize, track, and complete projects efficiently. Built with a focus on rich aesthetics, premium user experience, and robust workflow automation.

## 📁 Project Structure

```text
Team-Task-Manager/
├── client/          # React (Vite) Frontend with Tailwind 4
└── server/          # Node.js (Express) Backend with Prisma
```

## ✨ Key Features

- **Kanban Board & List Views**: Toggle between a visual status pipeline and a high-efficiency list view.
- **Advanced Workflows**: Track tasks through professional stages: `To Do`, `In Progress`, `Review`, `Testing`, `Done`, and `Blocked`.
- **Workflow Visualizer**: Dedicated page to map out the task lifecycle and define team processes.
- **Dynamic Settings**: Manage personal profiles and workspace details (Name, Description, Logo) with role-based controls.
- **Secure Auth (2FA)**: Mandatory email-based OTP verification for all sign-ins.
- **Real-Time Dashboards**: Beautiful stats cards and project overviews with dark mode support.
- **Project Tracking**: Manage team memberships and project-specific settings.

## 🚀 Quick Start

### 1. Backend Setup (Server)

```bash
cd server
npm install
# Configure your .env file (DATABASE_URL, JWT_SECRET, SMTP settings)
npx prisma generate
npx prisma db push
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
- **Styling**: Tailwind CSS 4 (Vanilla CSS approach)
- **State Management**: Redux Toolkit & React Context API
- **Icons**: Lucide React
- **Aesthetics**: Glassmorphism, HSL-curated color palettes, and modern typography (Outfit).

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma (PostgreSQL / Neon)
- **Security**: JWT, Bcrypt, and 2FA via Email
- **Email**: Nodemailer with SMTP integration

---

Developed with ❤️ by **Chirag Saxena**
