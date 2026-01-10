# MarkME - Automated Facial Recognition Attendance System

https://markme-ai-online.vercel.app/

MarkME is a state-of-the-art automated attendance system designed to streamline the attendance marking process using advanced facial recognition technology. This project integrates a modern web interface, a robust backend, and a dedicated AI service to provide a seamless experience for educational institutions.

![Project Status](https://img.shields.io/badge/Status-Development-blue)
![License](https://img.shields.io/badge/License-ISC-green)

## 🚀 Key Features

*   **Automated Attendance:** leverages cutting-edge facial recognition (InsightFace) to mark attendance from classroom group photos.
*   **Role-Based Access Control:** Secure portals for **Admins**, **Teachers**, and **Principals** with tailored dashboards.
*   **Modern & Responsive UI:** Built with **React 19**, **TailwindCSS 4**, and **Framer Motion** for a premium, animated user experience.
*   **Real-time Analytics:** View attendance reports, statistics, and trends instantly.
*   **Student & Class Management:** Comprehensive tools for managing student profiles, class schedules, and subjects.
*   **Excel Integration:** Support for bulk uploading students and exporting reports via Excel.

## 🏗️ Architecture

The project follows a microservices-inspired architecture with three main components:

1.  **Client (`/client`):** The frontend application built with Vite + React.
2.  **Server (`/server`):** The main application backend built with Node.js + Express.
3.  **AI Service (`/ai-service`):** A specialized Python/FastAPI service for facial recognition tasks.

## 🛠️ Tech Stack

### Frontend (Client)
*   **Framework:** React 19 (Vite)
*   **Styling:** TailwindCSS v4, Vanilla CSS
*   **Animations:** Framer Motion, Three.js (@react-three/fiber)
*   **State Management:** Zustand, React Redux
*   **Routing:** React Router DOM v7
*   **Icons:** Lucide React

### Backend (Server)
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB (Mongoose Schema)
*   **Authentication:** JWT (JSON Web Tokens) & Cookie-based Auth
*   **File Handling:** Multer, Cloudinary
*   **Email:** Nodemailer / Resend
*   **Utilities:** ExcelJS, Bcrypt, Validator

### AI Engine (AI Service)
*   **Framework:** FastAPI (Python)
*   **Models:** InsightFace (Buffalo_l), ONNX Runtime
*   **Processing:** OpenCV (headless), NumPy



## 📄 License

⚠️ Copyright Notice

This repository is public for viewing purposes only.
All rights are reserved.
No permission is granted to use, copy, modify, or distribute
this code without explicit written consent from the authors.
