import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
let isDemoMode = false;

const isLocalUri = (uri: string | undefined) => {
  if (!uri) return true;
  return uri.includes("localhost") || uri.includes("127.0.0.1") || uri.includes("0.0.0.0");
};

if (isLocalUri(MONGODB_URI)) {
  console.info("ℹ️ Running in DEMO MODE (In-Memory).");
  console.info("To persist data, add a remote MONGODB_URI (e.g. MongoDB Atlas) to your Secrets.");
  isDemoMode = true;
} else {
  mongoose.connect(MONGODB_URI!)
    .then(() => console.log("✅ Connected to Remote MongoDB"))
    .catch(err => {
      console.error("❌ Remote MongoDB connection failed:", err.message);
      console.warn("Falling back to DEMO MODE (In-Memory).");
      isDemoMode = true;
    });
}

// In-memory fallback stores
const demoLectures: any[] = [];
const demoAttendance: any[] = [];

// Schemas
const lectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  teacherId: { type: String, required: true },
  qrCode: { type: String, required: true, unique: true },
  qrSize: { type: Number, default: 256 },
  qrLevel: { type: String, enum: ['L', 'M', 'Q', 'H'], default: 'H' },
  startTime: { type: String },
  duration: { type: Number },
  date: { type: String },
  room: { type: String },
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: {
    transform: (doc, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

const attendanceSchema = new mongoose.Schema({
  lectureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture', required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, {
  toJSON: {
    transform: (doc, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

// Compound index to prevent duplicate attendance
attendanceSchema.index({ lectureId: 1, studentId: 1 }, { unique: true });

const Lecture = mongoose.model("Lecture", lectureSchema);
const Attendance = mongoose.model("Attendance", attendanceSchema);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
app.get("/api/lectures", async (req, res) => {
  try {
    if (isDemoMode) {
      const populated = demoLectures.map(l => ({
        ...l,
        attendanceCount: demoAttendance.filter(a => a.lectureId === l.id).length
      }));
      return res.json(populated);
    }
    const lectures = await Lecture.find().sort({ createdAt: -1 });
    const populated = await Promise.all(lectures.map(async (l: any) => {
      const count = await Attendance.countDocuments({ lectureId: l._id });
      return { ...l.toJSON(), attendanceCount: count };
    }));
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch lectures" });
  }
});

app.post("/api/lectures", async (req, res) => {
  try {
    const { title, teacherId, subject, qrSize, qrLevel, startTime, duration, date, room } = req.body;
    const lectureData = {
      title,
      teacherId,
      subject,
      qrSize: qrSize || 256,
      qrLevel: qrLevel || 'H',
      startTime,
      duration,
      date,
      room,
      qrCode: `lecture_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    if (isDemoMode) {
      const newLecture = { ...lectureData, id: Math.random().toString(36).substr(2, 9) };
      demoLectures.unshift(newLecture);
      return res.status(201).json(newLecture);
    }

    const newLecture = new Lecture(lectureData);
    await newLecture.save();
    res.status(201).json(newLecture);
  } catch (err) {
    res.status(500).json({ error: "Failed to create lecture" });
  }
});

app.get("/api/attendance/:lectureId", async (req, res) => {
  try {
    const { lectureId } = req.params;
    if (isDemoMode) {
      return res.json(demoAttendance.filter(a => a.lectureId === lectureId));
    }
    const records = await Attendance.find({ lectureId }).sort({ timestamp: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
});

app.post("/api/attendance", async (req, res) => {
  try {
    let { lectureId, qrCode, studentId, studentName } = req.body;
    
    if (!lectureId && qrCode) {
      if (isDemoMode) {
        const lecture = demoLectures.find(l => l.qrCode === qrCode);
        if (!lecture) return res.status(404).json({ message: "Lecture not found for this QR code" });
        lectureId = lecture.id;
      } else {
        const lecture = await Lecture.findOne({ qrCode });
        if (!lecture) return res.status(404).json({ message: "Lecture not found for this QR code" });
        lectureId = lecture._id;
      }
    }

    if (!lectureId) return res.status(400).json({ message: "Lecture ID or QR Code is required" });
    
    if (isDemoMode) {
      const existing = demoAttendance.find(a => a.lectureId === lectureId && a.studentId === studentId);
      if (existing) return res.status(400).json({ message: "Attendance already marked" });

      const record = {
        id: Math.random().toString(36).substr(2, 9),
        lectureId,
        studentId,
        studentName,
        timestamp: new Date()
      };
      demoAttendance.unshift(record);
      return res.status(201).json(record);
    }

    const record = new Attendance({
      lectureId,
      studentId,
      studentName
    });
    await record.save();
    res.status(201).json(record);
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Attendance already marked" });
    }
    console.error("Attendance Error:", err);
    res.status(500).json({ error: "Failed to mark attendance" });
  }
});

app.post("/api/attendance/bulk", async (req, res) => {
  try {
    const { lectureId, students } = req.body; // students: [{ id, name }]
    
    const results = [];
    for (const student of students) {
      if (isDemoMode) {
        const existing = demoAttendance.find(a => a.lectureId === lectureId && a.studentId === student.id);
        if (!existing) {
          const record = {
            id: Math.random().toString(36).substr(2, 9),
            lectureId,
            studentId: student.id,
            studentName: student.name,
            timestamp: new Date()
          };
          demoAttendance.unshift(record);
          results.push(record);
        }
      } else {
        try {
          const record = new Attendance({
            lectureId,
            studentId: student.id,
            studentName: student.name
          });
          await record.save();
          results.push(record);
        } catch (err: any) {
          if (err.code !== 11000) throw err;
          // Skip duplicates silently for bulk
        }
      }
    }
    res.status(201).json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to mark bulk attendance" });
  }
});

app.get("/api/attendance/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    if (isDemoMode) {
      // In demo mode, we need to populate lecture info for the history
      const studentRecords = demoAttendance.filter(a => a.studentId === studentId);
      const populated = studentRecords.map(record => {
        const lecture = demoLectures.find(l => l.id === record.lectureId);
        return {
          ...record,
          lectureTitle: lecture?.title || 'Unknown Lecture',
          subject: lecture?.subject || 'Unknown Subject'
        };
      });
      return res.json(populated);
    }
    const records = await Attendance.find({ studentId })
      .populate('lectureId')
      .sort({ timestamp: -1 });
    
    // Format for frontend
    const formatted = records.map((r: any) => ({
      id: r.id,
      lectureId: r.lectureId?.id,
      lectureTitle: r.lectureId?.title,
      subject: r.lectureId?.subject,
      studentId: r.studentId,
      studentName: r.studentName,
      timestamp: r.timestamp
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch student attendance" });
  }
});

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

