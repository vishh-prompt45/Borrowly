# 📚 Borrowly — Smart IoT Library Management System

Borrowly is a Smart IoT-based Library Management System built using ESP32-S3, RFID technology, React.js, Node.js, Express.js, and MySQL.

The system allows students to issue and return books using RFID-based identity verification in a kiosk-style interface.

---

## 🚀 Features

- RFID-based student authentication
- Book issue system
- Book return system
- Real-time RFID UID scanning from ESP32-S3
- MySQL database integration
- React kiosk-style frontend
- Node.js + Express backend APIs
- Book transaction tracking
- Automatic book availability updates
- Return date calculation

---

## 🛠️ Tech Stack

### Frontend
- React.js
- JavaScript
- CSS

### Backend
- Node.js
- Express.js

### Database
- MySQL

### Hardware
- ESP32-S3
- MFRC522 RFID Reader
- RFID Cards
- Buzzer
- LED Indicators

---

## 📡 Hardware Workflow

1. Student taps RFID card
2. ESP32-S3 reads RFID UID
3. UID sent to Node.js backend through Serial Communication
4. Backend validates student from MySQL database
5. Student enters book ISBN
6. Book gets issued/returned
7. Database updates automatically

---

## 📂 Project Structure

```plaintext
Borrowly/
│
├── frontend/      # React frontend
├── backend/       # Node.js backend
├── hardware/      # Arduino/ESP32 RFID code
└── README.md

## ▶️ Run Frontend

```bash
cd frontend
npm install
npm start
```

## ▶️ Run Backend

```bash
cd backend
npm install
node server.js
```