# 🏥 SAHTECH — Medical Specialist Management Platform

A production-ready React.js frontend for managing medical specialists, patients, AI analysis reports, appointments, and more.

---

## 📋 Table of Contents

- [Demo Accounts](#demo-accounts)
- [Tech Stack](#tech-stack)
- [Quick Start — Local Dev](#quick-start--local-dev)
- [Quick Start — Docker](#quick-start--docker)
- [VS Code Setup](#vs-code-setup)
- [Project Structure](#project-structure)
- [Features](#features)
- [Internationalization](#internationalization)
- [Environment Notes (Fedora GNOME)](#environment-notes-fedora-gnome)

---

## 🔑 Demo Accounts

| Role        | Email                    | Password    |
| ----------- | ------------------------ | ----------- |
| Admin       | admin@sahtech.tn         | admin123    |
| Dr. Benali  | amira.benali@sahtech.tn  | password123 |
| Dr. Meziane | karim.meziane@sahtech.tn | password123 |
| Dr. Touati  | samira.touati@sahtech.tn | password123 |

---

## 🛠 Tech Stack

| Layer     | Technology                               |
| --------- | ---------------------------------------- |
| Framework | React 18 + Vite 5                        |
| Routing   | React Router DOM v6                      |
| Styling   | Tailwind CSS v3                          |
| i18n      | i18next + react-i18next (FR/EN/AR + RTL) |
| HTTP      | Axios (mock data — no backend required)  |
| Maps      | React Leaflet + OpenStreetMap            |
| Charts    | Recharts                                 |
| State     | React Context API                        |
| Auth      | JWT mock stored in localStorage          |
| Container | Docker + nginx                           |

---

## 🚀 Quick Start — Local Dev

### Prerequisites (Fedora GNOME)

```bash
# Install Node.js 20 via nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Or via dnf
sudo dnf install nodejs npm
```

### Install & Run

```bash
# Clone or extract the project
cd sahtech

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at **http://localhost:5173**

### Build for production

```bash
npm run build
npm run preview  # preview production build locally
```

---

## 🐳 Quick Start — Docker

### Prerequisites

```bash
# Install Docker on Fedora
sudo dnf install docker docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
newgrp docker  # or log out and back in
```

### Run with Docker Compose

```bash
cd sahtech

# Build and start
docker-compose up --build

# Or in detached mode
docker-compose up --build -d
```

The app will be available at **http://localhost:3000**

### Useful Docker commands

```bash
# Stop the container
docker-compose down

# View logs
docker-compose logs -f sahtech-frontend

# Rebuild after code changes
docker-compose up --build --force-recreate

# Remove all containers and images
docker-compose down --rmi all
```

---

## 🖥 VS Code Setup

```bash
# Install VS Code on Fedora
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
sudo sh -c 'echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" > /etc/yum.repos.d/vscode.repo'
sudo dnf check-update
sudo dnf install code

# Open project
cd sahtech
code .
```

When VS Code opens, it will prompt you to **Install Recommended Extensions** — accept all. They include:

- **Prettier** — code formatting
- **ESLint** — linting
- **Tailwind CSS IntelliSense** — class autocomplete
- **ES7 React Snippets** — React shortcuts
- **Docker** — container management

---

## 📁 Project Structure

```
sahtech/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   └── logo.png                  # Replace with your logo
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.jsx
│   │   │   ├── LanguageSwitcher.jsx
│   │   │   ├── Logo.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── PageHeader.jsx
│   │   │   └── StatCard.jsx
│   │   └── layout/
│   │       ├── AdminLayout.jsx
│   │       └── SpecialistLayout.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── locales/
│   │   ├── ar.json                   # Arabic translations (RTL)
│   │   ├── en.json                   # English translations
│   │   └── fr.json                   # French translations
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.jsx
│   │   ├── specialist/
│   │   │   ├── AccueilPage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   ├── ExercisesPage.jsx
│   │   │   ├── PatientDetailPage.jsx
│   │   │   ├── PatientsPage.jsx
│   │   │   ├── PlanningPage.jsx
│   │   │   ├── PostsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── ReportsPage.jsx
│   │   │   ├── SearchPage.jsx
│   │   │   └── SpecialistDashboard.jsx
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminPatients.jsx
│   │       ├── AdminPosts.jsx
│   │       ├── AdminProfile.jsx
│   │       └── AdminSpecialists.jsx
│   ├── routes/
│   │   └── PrivateRoute.jsx
│   ├── services/
│   │   └── mockData.js               # All mock data
│   ├── App.jsx                       # Route definitions
│   ├── i18n.js                       # i18next config
│   ├── index.css                     # Tailwind + global styles
│   └── main.jsx                      # React entry point
├── .dockerignore
├── .vscode/
│   ├── extensions.json
│   └── settings.json
├── docker-compose.yml
├── Dockerfile
├── index.html
├── nginx.conf
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── vite.config.js
```

---

## ✨ Features

### Specialist Portal

| Page            | Route                      | Description                                                 |
| --------------- | -------------------------- | ----------------------------------------------------------- |
| Dashboard       | `/specialist/dashboard`    | Stats, recent AI reports, quick links, upcoming RDVs        |
| My Patients     | `/specialist/patients`     | Patient list with search/filter                             |
| Patient Detail  | `/specialist/patients/:id` | Info, treatment plan, notes, AI reports, chat               |
| AI Reports      | `/specialist/reports`      | All reports with color-coded severity, annotations          |
| Chat            | `/specialist/chat`         | Real-time-feel messaging with patients                      |
| Posts           | `/specialist/posts`        | Create/edit/delete articles, photos, videos                 |
| Accueil         | `/specialist/accueil`      | Post feed with pin feature                                  |
| Exercises       | `/specialist/exercises`    | Personal library + search 15+ exercises, assign to patients |
| Find Specialist | `/specialist/search`       | Search + filter + Leaflet map view                          |
| Planning        | `/specialist/planning`     | Weekly calendar, manage RDV requests                        |
| My Profile      | `/specialist/profile`      | Edit info, diplomas, languages, password, visibility        |

### Admin Portal

| Page        | Route                | Description                                  |
| ----------- | -------------------- | -------------------------------------------- |
| Dashboard   | `/admin/dashboard`   | Platform-wide stats, activity feed           |
| Specialists | `/admin/specialists` | Full list, approve/suspend/delete            |
| Patients    | `/admin/patients`    | Full list, activate/suspend/delete           |
| Moderation  | `/admin/posts`       | All posts, hide/show/delete, flag management |
| Profile     | `/admin/profile`     | Edit name, email, password                   |

---

## 🌐 Internationalization

The app supports **French**, **English**, and **Arabic** with full RTL layout for Arabic.

**To switch language:** Use the FR / EN / AR buttons in the sidebar or on the login page.

**Translation files:** `src/locales/{fr,en,ar}.json`

**To add a new key:**

1. Add the key to all three JSON files
2. Use it in components: `const { t } = useTranslation(); t('your.key')`

---

## 🎨 Adding Your Logo

Replace `src/assets/logo.png` with your actual logo file. The `Logo` component will automatically use it. Recommended size: **200×60px** or similar landscape format. If the image fails to load, a styled `SAHTECH` text fallback is shown.

---

## 🔧 Environment Notes (Fedora GNOME)

### Port already in use

```bash
# Check what's using port 3000
sudo ss -tlnp | grep 3000
# Or kill it
sudo fuser -k 3000/tcp
```

### Leaflet map not loading tiles

Ensure you have internet access. The map uses OpenStreetMap tiles (no API key needed).

### Node version issues

```bash
nvm use 20
# or
node --version  # should be >= 18
```

### Docker permission denied

```bash
sudo usermod -aG docker $USER
# Then log out and log back in, or:
newgrp docker
```

---

## 📄 License

© 2026 SAHTECH. All rights reserved.
