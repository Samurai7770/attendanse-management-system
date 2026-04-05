const Lecture = require('../models/Lecture');
const Attendance = require('../models/Attendance');

const getLectures = async (req, res) => {
  try {
    const lectures = await Lecture.find().populate('teacherId', 'name email');
    const lecturesResponse = lectures.map(lecture => ({
      id: lecture._id.toString(),
      title: lecture.title,
      subject: lecture.subject,
      teacherId: lecture.teacherId._id.toString(),
      createdAt: lecture.createdAt,
      qrCode: lecture.qrCode,
      qrSize: lecture.qrSize,
      qrLevel: lecture.qrLevel,
      attendanceCount: lecture.attendanceCount,
      startTime: lecture.startTime,
      duration: lecture.duration,
      date: lecture.date,
      room: lecture.room
    }));
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

    const lecture = new Lecture({
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
      id: lecture._id.toString(),
      title: lecture.title,
      subject: lecture.subject,
      teacherId: lecture.teacherId.toString(),
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
    if (error.code === 11000) {
      res.status(400).json({ message: 'QR code already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

const getLectureById = async (req, res) => {
  try {
    const { id } = req.params;
    const lecture = await Lecture.findById(id).populate('teacherId', 'name email');
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }
    const lectureResponse = {
      id: lecture._id.toString(),
      title: lecture.title,
      subject: lecture.subject,
      teacherId: lecture.teacherId._id.toString(),
      createdAt: lecture.createdAt,
      qrCode: lecture.qrCode,
      qrSize: lecture.qrSize,
      qrLevel: lecture.qrLevel,
      startTime: lecture.startTime,
      duration: lecture.duration,
      date: lecture.date,
      room: lecture.room
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