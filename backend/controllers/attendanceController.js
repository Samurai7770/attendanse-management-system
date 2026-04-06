const Attendance = require('../models/Attendance');
const Lecture = require('../models/Lecture');

const markAttendance = async (req, res) => {
  try {
    const { qrCode } = req.body;
    const studentId = req.session.userId;
    const studentName = req.session.name;

    if (!qrCode) {
      return res.status(400).json({ message: 'QR code is required' });
    }

    // Find lecture by QR code
    const lecture = await Lecture.findOne({ qrCode });
    if (!lecture) {
      return res.status(404).json({ message: 'Invalid QR code' });
    }

    // Check if attendance already marked
    const existingAttendance = await Attendance.findOne({
      lectureId: lecture.id,
      studentId
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for this lecture' });
    }

    // Create attendance record
    const attendance = Attendance.create({
      lectureId: lecture.id,
      studentId,
      studentName
    });

    await attendance.save();
    res.status(201).json({ message: 'Attendance marked successfully', attendance: {
      id: attendance.id,
      lectureId: attendance.lectureId,
      studentId: attendance.studentId,
      studentName: attendance.studentName,
      timestamp: attendance.timestamp
    } });
  } catch (error) {
    console.error('Error in markAttendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAttendanceByLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const attendance = await Attendance.find({ lectureId });
    const attendanceResponse = attendance.map(att => ({
      id: att.id,
      lectureId: att.lectureId,
      studentId: att.studentId,
      studentName: att.studentName,
      timestamp: att.timestamp
    }));
    res.status(200).json(attendanceResponse);
  } catch (error) {
    console.error('Error in getAttendanceByLecture:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAttendanceByStudent = async (req, res) => {
  try {
    const studentId = req.session.userId;
    const attendance = await Attendance.find({ studentId });

    // Get unique lecture IDs
    const lectureIds = [...new Set(attendance.map(a => a.lectureId))];
    const lectures = await Promise.all(lectureIds.map(async (id) => {
      const admin = require('firebase-admin');
      const db = admin.firestore();
      const doc = await db.collection('lectures').doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }));
    const lectureMap = {};
    lectures.forEach(lecture => {
      if (lecture) lectureMap[lecture.id] = lecture;
    });

    const attendanceResponse = attendance.map(att => {
      const lecture = lectureMap[att.lectureId];
      return {
        id: att.id,
        lectureId: {
          id: att.lectureId,
          title: lecture ? lecture.title : 'Unknown',
          subject: lecture ? lecture.subject : 'Unknown',
          date: lecture ? lecture.date : 'Unknown',
          startTime: lecture ? lecture.startTime : 'Unknown',
          room: lecture ? lecture.room : 'Unknown'
        },
        studentId: att.studentId,
        studentName: att.studentName,
        timestamp: att.timestamp
      };
    });
    res.status(200).json(attendanceResponse);
  } catch (error) {
    console.error('Error in getAttendanceByStudent:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const bulkMarkAttendance = async (req, res) => {
  try {
    const { lectureId, students } = req.body;

    if (!lectureId || !students || !Array.isArray(students)) {
      return res.status(400).json({ message: 'LectureId and students array are required' });
    }

    const attendanceRecords = students.map(student => ({
      lectureId,
      studentId: student.id,
      studentName: student.name
    }));

    // Insert records one by one, skip duplicates
    let insertedCount = 0;
    for (const record of attendanceRecords) {
      try {
        const existing = await Attendance.findOne({
          lectureId: record.lectureId,
          studentId: record.studentId
        });
        if (!existing) {
          const attendance = Attendance.create(record);
          await attendance.save();
          insertedCount++;
        }
      } catch (error) {
        // Skip duplicates
        continue;
      }
    }

    res.status(201).json({ message: 'Bulk attendance marked successfully', insertedCount });
  } catch (error) {
    console.error('Error in bulkMarkAttendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  markAttendance,
  getAttendanceByLecture,
  getAttendanceByStudent,
  bulkMarkAttendance
};