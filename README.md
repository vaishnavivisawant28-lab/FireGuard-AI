# 🔥 FireGuard AI

> Intelligent Fire Alarm Monitoring & Emergency Response Platform

![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Express](https://img.shields.io/badge/Express.js-Backend-black?style=for-the-badge&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-green?style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-38BDF8?style=for-the-badge&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)

---

## 📖 Overview

FireGuard AI is a modern full-stack fire alarm monitoring platform designed to provide real-time visibility into fire alarm systems, emergency alerts, event tracking, and safety analytics.

The platform enables organizations, educational institutions, industries, hospitals, commercial buildings, and smart infrastructure systems to monitor fire alarm statuses through an interactive dashboard while maintaining historical records of incidents for analysis and compliance.

Built with React, TypeScript, Express.js, PostgreSQL, and Drizzle ORM, FireGuard AI delivers a scalable, secure, and responsive solution for fire safety management.

---

## 🎯 Problem Statement

Traditional fire alarm systems often lack centralized monitoring, analytics, and real-time visualization capabilities. Safety personnel may face delays in identifying incidents, monitoring multiple facilities, or maintaining historical records.

FireGuard AI addresses these challenges by:

- Providing real-time fire alarm monitoring
- Centralizing incident management
- Recording alarm history
- Displaying emergency alerts instantly
- Supporting data-driven safety decisions
- Enhancing operational awareness

---

## ✨ Features

### 🔥 Real-Time Fire Monitoring
- Live fire alarm status updates
- Active alarm tracking
- Emergency event visualization
- Continuous monitoring system

### 🚨 Emergency Alert Management
- Instant emergency notifications
- Alarm severity indicators
- Incident categorization
- Alert history tracking

### 📊 Analytics Dashboard
- Alarm frequency charts
- Event trend visualization
- Monitoring statistics
- Historical reporting

### 🗄️ Event Logging & Storage
- PostgreSQL-powered storage
- Incident history records
- Event timestamps
- Secure database management

### 📱 Responsive User Interface
- Mobile-friendly dashboard
- Tablet support
- Desktop optimization
- Modern UI/UX

### 🔒 Secure Architecture
- Type-safe APIs
- Schema validation using Zod
- Secure backend architecture
- Reliable data handling

---

## 🏗️ System Architecture

```text
Fire Alarm Devices
        │
        ▼
 Monitoring Layer
        │
        ▼
   Express.js API
        │
        ▼
     Drizzle ORM
        │
        ▼
 PostgreSQL Database
        │
        ▼
 React Dashboard UI
        │
        ▼
      End Users
```

---

## 🛠️ Technology Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Radix UI
- Framer Motion
- TanStack Query
- Wouter Router
- Recharts

### Backend
- Node.js
- Express.js
- TypeScript
- Pino Logging
- Zod Validation

### Database
- PostgreSQL
- Drizzle ORM
- Drizzle Kit

### Deployment
- Replit
- Vite Build System

---

## 📂 Project Structure

```text
FireGuard-AI/
│
├── artifacts/
│   ├── fire-alarm/
│   │   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── assets/
│   │
│   └── api-server/
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       └── middleware/
│
├── lib/
│   ├── db/
│   │   ├── schema/
│   │   └── index.ts
│   │
│   ├── api-client-react/
│   ├── api-spec/
│   └── api-zod/
│
├── scripts/
├── package.json
├── pnpm-lock.yaml
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/vaishnavivisawant28-lab/FireGuard-AI.git
cd FireGuard-AI
```

### Install Dependencies

```bash
pnpm install
```

or

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/fireguard
PORT=5000
NODE_ENV=development
```

### Push Database Schema

```bash
pnpm run push
```

### Start Development Server

```bash
pnpm dev
```

---

## 🗄️ Database Commands

Apply database schema:

```bash
pnpm run push
```

Force apply schema:

```bash
pnpm run push-force
```

---

## 🔄 Workflow

```text
Alarm Trigger
      │
      ▼
Backend Receives Event
      │
      ▼
Data Validation (Zod)
      │
      ▼
Database Storage
      │
      ▼
Dashboard Update
      │
      ▼
Alert Notification
      │
      ▼
Event Logging
```

---

## 📊 Dashboard Modules

### 🔥 Fire Status Panel
Displays:
- Active alarms
- Safe status
- Emergency conditions

### 🚨 Alerts Section
Provides:
- Critical alerts
- Warning notifications
- Incident details

### 📈 Analytics Dashboard
Displays:
- Alarm frequency
- Monthly reports
- Historical incidents
- Trend analysis

### 📜 Event History
Stores:
- Timestamped records
- Alarm events
- Status changes
- Emergency logs

---

## 🎯 Applications

- 🏢 Commercial Buildings
- 🏭 Industrial Facilities
- 🏥 Hospitals
- 🏫 Educational Institutions
- 🏠 Smart Buildings
- ✈️ Transportation Hubs

---

## 🔒 Security Features

- Type-safe API architecture
- PostgreSQL secure storage
- Input validation using Zod
- Structured error handling
- Database schema enforcement
- Backend logging and monitoring

---

## 🚀 Future Enhancements

- AI-powered fire risk prediction
- Smoke detection integration
- IoT sensor connectivity
- SMS alert system
- Email notifications
- Mobile application
- GIS-based emergency mapping
- Multi-location monitoring
- Predictive analytics dashboard

---

## 📸 Screenshots

### Dashboard
_Add dashboard screenshot here_

### Fire Alarm Monitoring
_Add monitoring screenshot here_

### Analytics Panel
_Add analytics screenshot here_

### Alert Management
_Add alert management screenshot here_

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/NewFeature
```

3. Commit changes

```bash
git commit -m "Add New Feature"
```

4. Push to GitHub

```bash
git push origin feature/NewFeature
```

5. Open a Pull Request

---

## 👩‍💻 Author

**Vaishnavi Visawant**

Computer Science Engineering Student

GitHub: https://github.com/vaishnavivisawant28-lab

---

## 🏆 Project Highlights

✅ Full-Stack Architecture

✅ React 19 + TypeScript

✅ Express.js API

✅ PostgreSQL Database

✅ Drizzle ORM

✅ Real-Time Monitoring

✅ Analytics Dashboard

✅ Responsive Design

✅ Enterprise Ready

---

## 📜 License

This project is licensed under the MIT License.

---

## ⭐ Support

If you found this project useful:

⭐ Star the repository

🍴 Fork the project

🛠️ Contribute improvements

📢 Share with others

---

# 🔥 FireGuard AI
### Smart Monitoring • Faster Response • Safer Future 🚒





