export interface User {
  id: string;
  name: string;
  role: 'teacher' | 'student';
  email: string;
}

export interface Lecture {
  id: string;
  title: string;
  subject: string;
  teacherId: string;
  createdAt: string;
  qrCode: string;
  qrSize?: number;
  qrLevel?: 'L' | 'M' | 'Q' | 'H';
  attendanceCount?: number;
  startTime?: string;
  duration?: number;
  date?: string;
  room?: string;
}

export interface AttendanceRecord {
  id: string;
  lectureId: string;
  studentId: string;
  studentName: string;
  timestamp: string;
}
