# QR Attendance System

A modern, mobile-friendly attendance tracking system using QR codes. Teachers can generate QR codes for lectures, and students can mark their attendance by scanning the QR code on their mobile devices.

## 🌟 Features

- **QR Code Generation**: Teachers can instantly generate QR codes for each lecture
- **Mobile QR Scanning**: Students use their mobile devices to scan QR codes and mark attendance
- **Session-Based Authentication**: Secure login with session cookies stored in MongoDB
- **Real-time Attendance Tracking**: See attendance records updated in real-time
- **Activity History**: Students can view their attendance history and absence alerts
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Role-Based Access**: Different interfaces for teachers and students

## 🏗️ Project Structure

```
qr-attendance-system/
├── backend/                # Express.js server
│   ├── config/           # Firebase configuration
│   ├── controllers/       # Route controllers
│   ├── models/           # Firestore models
│   ├── routes/           # API routes
│   ├── middleware/        # Auth middleware
│   ├── server.js         # Main server file
│   └── package.json
├── frontend/             # React + TypeScript
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utilities
│   │   ├── App.tsx       # Main app
│   │   └── types.ts      # TypeScript types
│   ├── vite.config.ts
│   └── package.json
└── DEPLOYMENT.md         # Deployment guide
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Firebase Project (with Firestore enabled)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/qr-attendance-system.git
cd qr-attendance-system
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Firebase project ID and SESSION_SECRET
# For production, you'll need to set FIREBASE_SERVICE_ACCOUNT_KEY
npm run dev
```

The backend will run on `http://localhost:5000`

3. **Frontend Setup** (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📱 Usage

### For Teachers:
1. Login with your email and name
2. Select "Teacher" role
3. Click "New Lecture" to create a lecture session
4. A QR code will be generated automatically
5. Download the QR code or display it on screen
6. View real-time attendance as students scan the code
7. Download attendance as CSV

### For Students:
1. Login with your email and name
2. Select "Student" role
3. Click "Initialize Scanner" to activate QR camera
4. Scan the lecture QR code provided by your instructor
5. Your attendance will be marked immediately
6. View your attendance history and absence alerts

## 🔐 Security Features

- **Session-Based Authentication**: Secure sessions stored in Firebase
- **HttpOnly Cookies**: Prevents XSS attacks
- **CORS Protection**: Configurable for allowed origins
- **Role-Based Access Control**: Different permissions for teachers and students
- **Password Environment Variables**: Sensitive data in .env files

## 📚 API Endpoints

### Authentication
- `POST /api/users/login` - Login/Create user
- `POST /api/users/logout` - Logout
- `GET /api/users/me` - Get current user

### Lectures
- `GET /api/lectures` - Get all lectures
- `POST /api/lectures` - Create lecture (teacher only)
- `GET /api/lectures/:id` - Get lecture details

### Attendance
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/lecture/:lectureId` - Get lecture attendance
- `GET /api/attendance/student` - Get student attendance history
- `POST /api/attendance/bulk` - Bulk mark attendance

## 🌐 Mobile Access

To access the system on mobile devices on the same network:

1. Start the frontend with network access:
```bash
npm run dev
```

2. Note the network URL displayed (e.g., `http://192.168.x.x:5173`)

3. Open that URL on your mobile device browser

## 📦 Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **express-session** - Session management
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **html5-qrcode** - QR code scanning
- **qrcode.react** - QR code generation
- **Motion** - Animations
- **date-fns** - Date formatting

## 🚀 Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

Quick deployment:
1. Deploy backend to Render
2. Deploy frontend to Vercel
3. Connect MongoDB Atlas
4. Update environment variables

## 🐛 Troubleshooting

### QR Camera not working on mobile?
- Ensure HTTPS is enabled
- Check camera permissions
- Try using native browser (not WebView)

### Attendance not saving?
- Verify MongoDB connection
- Check session cookies are enabled
- Look at browser console for errors

### CORS errors?
- Ensure backend CORS is configured for frontend URL
- Check that credentials: 'include' is set in fetch calls

## 📝 Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/qr-attendance
SESSION_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env.production)
```
VITE_API_URL=https://your-backend-url.com
```

## 📄 License

MIT License - feel free to use this project for educational purposes

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please create an issue on GitHub.

---

**Created with ❤️ for educational institutions**