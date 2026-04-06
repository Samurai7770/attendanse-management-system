const Lecture = require('../models/Lecture');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

const getLectures = async (req, res) => {
  try {
    const lectures = await Lecture.find();

    // Get unique teacher IDs
    const teacherIds = [...new Set(lectures.map(l => l.teacherId))];
    const teachers = await Promise.all(teacherIds.map(id => User.findOne({ id })));
    const teacherMap = {};
    teachers.forEach(teacher => {
      if (teacher) teacherMap[teacher.id] = teacher;
    });

    const lecturesResponse = lectures.map(lecture => {
      const teacher = teacherMap[lecture.teacherId];
      return {
        id: lecture.id,
        title: lecture.title,
        subject: lecture.subject,
        teacherId: lecture.teacherId,
        teacherName: teacher ? teacher.name : 'Unknown',
        teacherEmail: teacher ? teacher.email : 'Unknown',
        createdAt: lecture.createdAt,
        qrCode: lecture.qrCode,
        qrSize: lecture.qrSize,
        qrLevel: lecture.qrLevel,
        startTime: lecture.startTime,
        duration: lecture.duration,
        date: lecture.date,
        room: lecture.room
      };
    });
    res.status(200).json(lecturesResponse);
  } catch (error) {
    console.error('Error in getLectures:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createLecture = async (req, res) => {
  try {
    const { title, subject, qrSize, qrLevel, startTime, duration, date, room } = req.body;
    const teacherId = req.session.userId;

    if (!title || !subject) {
      return res.status(400).json({ message: 'Title and subject are required' });
    }

    // Generate unique QR code
    const qrCode = `QR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const lecture = Lecture.create({
      title,
      subject,
      teacherId,
      qrCode,
      qrSize: qrSize || 256,
      qrLevel: qrLevel || 'H',
      startTime,
      duration: duration || 60,
      date,
      room
    });

    await lecture.save();
    const lectureResponse = {
      id: lecture.id,
      title: lecture.title,
      subject: lecture.subject,
      teacherId: lecture.teacherId,
      createdAt: lecture.createdAt,
      qrCode: lecture.qrCode,
      qrSize: lecture.qrSize,
      qrLevel: lecture.qrLevel,
      startTime: lecture.startTime,
      duration: lecture.duration,
      date: lecture.date,
      room: lecture.room
    };
    res.status(201).json(lectureResponse);
  } catch (error) {
    console.error('Error in createLecture:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getLectureById = async (req, res) => {
  try {
    const { id } = req.params;

    // For Firestore, we need to get the document by ID
    const admin = require('firebase-admin');
    const db = admin.firestore();
    const doc = await db.collection('lectures').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    const lectureData = doc.data();
    const teacher = await User.findOne({ id: lectureData.teacherId });

    const lectureResponse = {
      id: doc.id,
      title: lectureData.title,
      subject: lectureData.subject,
      teacherId: lectureData.teacherId,
      teacherName: teacher ? teacher.name : 'Unknown',
      teacherEmail: teacher ? teacher.email : 'Unknown',
      createdAt: lectureData.createdAt,
      qrCode: lectureData.qrCode,
      qrSize: lectureData.qrSize,
      qrLevel: lectureData.qrLevel,
      startTime: lectureData.startTime,
      duration: lectureData.duration,
      date: lectureData.date,
      room: lectureData.room
    };
    res.status(200).json(lectureResponse);
  } catch (error) {
    console.error('Error in getLectureById:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getLectures,
  createLecture,
  getLectureById
};