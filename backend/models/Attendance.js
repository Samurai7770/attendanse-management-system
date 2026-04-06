const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate attendance for same student in same lecture
attendanceSchema.index({ lectureId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);