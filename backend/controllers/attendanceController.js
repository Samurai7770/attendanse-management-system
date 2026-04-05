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
      lectureId: lecture._id,
      studentId
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for this lecture' });
    }

    // Create attendance record
    const attendance = new Attendance({
      lectureId: lecture._id,
      studentId,
      studentName
    });

    await attendance.save();
    res.status(201).json({ message: 'Attendance marked successfully', attendance: {
      id: attendance._id.toString(),
      lectureId: attendance.lectureId.toString(),
      studentId: attendance.studentId.toString(),
      studentName: attendance.studentName,
      timestamp: attendance.timestamp
    } });
  } catch (error) {
    console.error('Error in markAttendance:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Attendance already marked' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

const getAttendanceByLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const attendance = await Attendance.find({ lectureId }).sort({ timestamp: 1 });
    const attendanceResponse = attendance.map(att => ({
      id: att._id.toString(),
      lectureId: att.lectureId.toString(),
      studentId: att.studentId.toString(),
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
    const attendance = await Attendance.find({ studentId })
      .populate('lectureId', 'title subject date startTime room')
      .sort({ timestamp: -1 });
    const attendanceResponse = attendance.map(att => ({
      id: att._id.toString(),
      lectureId: {
        id: att.lectureId._id.toString(),
        title: att.lectureId.title,
        subject: att.lectureId.subject,
        date: att.lectureId.date,
        startTime: att.lectureId.startTime,
        room: att.lectureId.room
      },
      studentId: att.studentId.toString(),
      studentName: att.studentName,
      timestamp: att.timestamp
    }));
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

    // Insert many, ignore duplicates
    const result = await Attendance.insertMany(attendanceRecords, { ordered: false });

    res.status(201).json({ message: 'Bulk attendance marked successfully', insertedCount: result.length });
  } catch (error) {
    console.error('Error in bulkMarkAttendance:', error);
    // If some duplicates, still return success with count
    if (error.code === 11000) {
      res.status(201).json({ message: 'Bulk attendance marked (some duplicates ignored)' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = {
  markAttendance,
  getAttendanceByLecture,
  getAttendanceByStudent,
  bulkMarkAttendance
};