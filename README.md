# MarkME - Automated Facial Recognition Attendance System

MarkME is a state-of-the-art automated attendance system designed to streamline the attendance marking process using advanced facial recognition technology. Built for the **Smart India Hackathon (SIH)**, this project integrates a modern web interface, a robust backend, and a dedicated AI service to provide a seamless experience for educational institutions.

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

## ⚙️ Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   Python (v3.10+)
*   MongoDB Instance (Local or Atlas)
*   Git

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/SIH-MarkME.git
cd SIH-MarkME
```

### 2. Backend Setup (Node.js)
```bash
cd server
npm install
```
*   Create a `.env` file in the `server` directory and configure the following:
    ```env
    NODE_PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    CLIENT_URL=http://localhost:5173
    # Cloudinary & Email configs...
    ```
*   Start the server:
    ```bash
    npm start
    ```

### 3. AI Service Setup (Python)
```bash
cd ai-service
# Recommended: Create a virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```
*   Create a `.env` file in `ai-service`:
    ```env
    HOST=0.0.0.0
    PORT=8000
    ```
*   Start the service:
    ```bash
    python main.py
    ```

### 4. Frontend Setup (React)
```bash
cd client
npm install
```
*   Create a `.env` file in `client` (if needed for API base URLs):
    ```env
    VITE_API_URL=http://localhost:5000
    ```
*   Start the development server:
    ```bash
    npm run dev
    ```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the ISC License.
