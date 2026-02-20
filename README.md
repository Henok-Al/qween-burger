# 🍔 Qween Burger - Burger Ordering Website

A full-stack MERN application for ordering delicious burgers online.

## 📁 Project Structure

```
qween-burger/
├── backend/                 # Node.js + Express API
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── server.js           # Entry point
│   └── .env                # Environment variables
├── frontend/               # React + Vite app (to be created)
└── README.md               # This file
```

## 🚀 Features

### User Features

- Register & Login with JWT authentication
- Browse burgers
- View burger details
- Add/remove items from cart
- Update quantities
- Place orders
- View order history

### Admin Features

- Admin login
- Add/Edit/Delete burgers
- Manage orders
- Update order status

## 🛠️ Tech Stack

### Backend

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Bcryptjs for password hashing

### Frontend

- React (Vite)
- Tailwind CSS
- Axios
- Context API for state management

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd qween-burger
```

### 2. Backend Setup

```bash
cd backend
npm install
# Create .env file with your configuration
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 🔐 Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/qween-burger
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

## 📚 API Documentation

(To be added)

## 📝 License

ISC
