const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendanceByLecture,
  getAttendanceByStudent,
  bulkMarkAttendance
} = require('../controllers/attendanceController');

router.post('/', markAttendance);
router.get('/lecture/:lectureId', getAttendanceByLecture);
router.get('/student', getAttendanceByStudent);
router.post('/bulk', bulkMarkAttendance);

module.exports = router;