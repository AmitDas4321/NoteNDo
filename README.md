<p align="center">
  <img src="./assets/banner.jpg" alt="NoteNDo Banner" width="800">
</p>

<p align="center">
  <b>Smart To-Do & Reminder App with WhatsApp Alerts ⚡</b>
</p>

<h1 align="center">NoteNDo — Smart Task Manager</h1>

<p align="center">
  <b>Simple • Fast • Reliable 🚀</b><br>
  Developed by <a href="https://www.amitdas.site/">Amit Das</a>
</p>

---

## 🚀 Overview

**NoteNDo** is a modern full-stack to-do application that helps you manage tasks, organize notes, and receive smart reminders directly on WhatsApp.

It combines real-time cloud syncing with an automated reminder system, ensuring you never miss important tasks. Designed for simplicity and performance, NoteNDo is perfect for daily productivity.

---

## ⚡ Quick Start

```bash
# Clone the repository
git clone https://github.com/AmitDas4321/NoteNDo.git
cd NoteNDo

# Install dependencies
npm install

# Start development server
npm run dev
````

Open:

```
http://localhost:3000
```

---

## 📸 Preview

<p align="center">
  <img src="./assets/preview.png" alt="NoteNDo Preview" width="800">
</p>

---

## ⚡ Core Features

* ✅ Task & To-Do Management
* 🔔 Smart Reminder System
* 📲 WhatsApp Notifications
* ☁️ Firebase Realtime Sync
* 🧑 User Profile Management
* 🖼 Media Attachment Support
* 🌍 Timezone-aware Scheduling
* 📱 Fully Responsive UI

---

## 🧠 How It Works

1. Create a task 📝
2. Set reminder date & time ⏰
3. Data stored in Firebase ☁️
4. Background service checks reminders 🔄
5. WhatsApp notification sent 📲
6. Task marked as notified ✅

---

## 🖥️ Dashboard Sections

### 📝 Tasks

* Create / edit / delete tasks
* Mark as completed
* Add media & descriptions

### 🔔 Reminders

* Set date & time
* Enable / disable reminders
* WhatsApp alerts

### 👤 Profile

* Manage user info
* Set timezone

---

## 📊 Live Features

* Real-time updates
* Reminder tracking
* Task status (pending / done)
* Notification logs

---

## 🌐 API Endpoints

| Endpoint                     | Description   |
| ---------------------------- | ------------- |
| `/api/db/todos`              | Get tasks     |
| `/api/db/todos` (POST)       | Create task   |
| `/api/db/todos/:id`          | Update task   |
| `/api/db/todos/:id` (DELETE) | Delete task   |
| `/api/db/users/:uid`         | Get user      |
| `/api/db/users/:uid`         | Update user   |
| `/api/whatsapp/send`         | Send WhatsApp |
| `/api/upload`                | Upload files  |

---

## ⚙️ Background System

* Runs every minute
* Checks reminder time
* Sends WhatsApp alerts
* Marks reminders as sent

---

## 📦 Tech Stack

* ⚛️ React
* 🎨 Tailwind CSS
* ⚡ Vite
* 🧠 Node.js + Express
* 🔥 Firebase Realtime DB
* 📲 TextSnap API
* 📡 Multer

---

## 📁 Project Structure

```
NoteNDo
├ src/
├ server.ts
├ package.json
├ vite.config.ts
├ tsconfig.json
└ README.md
```

---

# 🚀 Deployment Guide

---

## 🌐 Deploy on Render

1. Push to GitHub
2. Go to Render → New Web Service
3. Connect repo

### Build & Start

```bash
Build: npm install && npm run build
Start: npm start
```

---

### ⚙️ Environment Variables

```
APP_URL=https://your-app.onrender.com
TEXTSNAP_INSTANCE_ID=your_id
TEXTSNAP_ACCESS_TOKEN=your_token
FIREBASE_DATABASE_URL=your_db_url
FIREBASE_DATABASE_SECRET=your_secret
NODE_ENV=production
```

---

### ⚠️ Notes

* Use dynamic port:

```js
const PORT = process.env.PORT || 3000;
```

* Do NOT upload `.env`
* Free tier may sleep (reminders pause)

---

## 🖥️ Deploy on VPS (Ubuntu)

### Install & Setup

```bash
git clone https://github.com/yourusername/NoteNDo.git
cd NoteNDo
npm install
npm run build
```

---

### Create `.env`

```
APP_URL=http://your-ip:3000
TEXTSNAP_INSTANCE_ID=xxx
TEXTSNAP_ACCESS_TOKEN=xxx
FIREBASE_DATABASE_URL=xxx
FIREBASE_DATABASE_SECRET=xxx
NODE_ENV=production
```

---

### ▶️ Run with PM2

```bash
npm install -g pm2
pm2 start server.ts --name notendo --interpreter tsx
pm2 save
pm2 startup
```

---

## 🌍 Nginx (Custom Domain)

```nginx
server {
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}
```

---

## 🐳 Docker (Optional)

```bash
docker build -t notendo .
docker run -p 3000:3000 --env-file .env notendo
```

---

## ⚠️ Production Tips

* Use VPS for 24/7 reminders
* Secure `.env`
* Use HTTPS
* Monitor with PM2

---

## 📬 Support

<p align="center">
  <a href="https://t.me/BlueOrbitDevs">
    <img src="https://img.shields.io/badge/Telegram-Support-blue?style=for-the-badge&logo=telegram">
  </a>
</p>

---

## 📜 License

MIT License © 2026 Amit Das

---

<p align="center">
  <b>Built with ⚡ using React & Express</b><br>
  Made with ❤️ by <a href="https://amitdas.site">Amit Das</a>
</p>