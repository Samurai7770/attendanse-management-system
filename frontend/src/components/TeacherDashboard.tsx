import React, { useState, useEffect } from 'react';
import { User, Lecture, AttendanceRecord } from '../types';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Plus, Users, Calendar, BookOpen, QrCode, X, CheckCircle2, Download, Image as ImageIcon, ArrowRight, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

interface TeacherDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function TeacherDashboard({ user, onLogout }: TeacherDashboardProps) {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLecture, setNewLecture] = useState({ 
    title: '', 
    subject: '', 
    qrSize: 256, 
    qrLevel: 'H' as 'L' | 'M' | 'Q' | 'H',
    startTime: '',
    duration: 60,
    date: format(new Date(), 'yyyy-MM-dd'),
    room: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [manualStudentNames, setManualStudentNames] = useState('');
  const [isMarkingManual, setIsMarkingManual] = useState(false);
  const [hoveredLectureId, setHoveredLectureId] = useState<string | null>(null);

  useEffect(() => {
    fetchLectures();
  }, []);

  useEffect(() => {
    if (selectedLecture) {
      fetchAttendance(selectedLecture.id);
      const interval = setInterval(() => fetchAttendance(selectedLecture.id), 15000);
      return () => clearInterval(interval);
    }
  }, [selectedLecture]);

  const fetchLectures = async () => {
    try {
      const res = await fetch('/api/lectures', { credentials: 'include' });
      const data = await res.json();
      setLectures(data.filter((l: Lecture) => l.teacherId === user.id));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async (id: string) => {
    try {
      const res = await fetch(`/api/attendance/lecture/${id}`, { credentials: 'include' });
      const data = await res.json();
      setAttendance(data);
    } catch (err) {
      console.error(err);
    }
  };

  const downloadCSV = () => {
    if (!selectedLecture || attendance.length === 0) return;
    
    const headers = ['Student Name', 'Timestamp'];
    const rows = attendance.map(record => [
      record.studentName,
      format(new Date(record.timestamp), 'yyyy-MM-dd HH:mm:ss')
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_${selectedLecture.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadQRCode = () => {
    if (!selectedLecture) return;
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr_${selectedLecture.title.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleManualAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLecture || !manualStudentNames.trim()) return;

    setIsMarkingManual(true);
    try {
      const studentNames = manualStudentNames
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);

      const students = studentNames.map(name => ({
        id: `manual_${Math.random().toString(36).substr(2, 9)}`,
        name
      }));

      const res = await fetch('/api/attendance/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          lectureId: selectedLecture.id,
          students
        })
      });

      if (res.ok) {
        setManualStudentNames('');
        fetchAttendance(selectedLecture.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsMarkingManual(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include'
      });
      onLogout();
    } catch (err) {
      console.error('Logout error:', err);
      onLogout(); // Still logout on client side
    }
  };

  const handleCreateLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/lectures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newLecture)
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewLecture({ 
          title: '', 
          subject: '', 
          qrSize: 256, 
          qrLevel: 'H',
          startTime: '',
          duration: 60,
          date: format(new Date(), 'yyyy-MM-dd'),
          room: ''
        });
        fetchLectures();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between border-b border-line pb-8">
        <div>
          <h2 className="text-4xl font-bold text-ink tracking-tighter uppercase">Lectures</h2>
          <p className="text-ink/40 font-mono text-[10px] uppercase tracking-widest mt-2">Academic Session 2026/27</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="btn-secondary flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="uppercase tracking-widest text-xs font-bold">Logout</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-3 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span className="uppercase tracking-widest text-xs font-bold">New Lecture</span>
          </button>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <QrCode className="h-5 w-5 text-ink/20 group-focus-within:text-accent transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Filter by title or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-12 pr-4 py-4 bg-white border border-line rounded-2xl outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent transition-all font-medium placeholder:text-ink/20"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {lectures
          .filter(lecture => 
            lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            lecture.subject.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((lecture) => (
          <motion.div
            layoutId={lecture.id}
            key={lecture.id}
            onClick={() => setSelectedLecture(lecture)}
            onMouseEnter={() => setHoveredLectureId(lecture.id)}
            onMouseLeave={() => setHoveredLectureId(null)}
            className="glass-card p-8 hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden"
          >
            <AnimatePresence>
              {hoveredLectureId === lecture.id && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute inset-x-0 bottom-0 p-4 bg-ink/95 backdrop-blur-sm text-white z-20 flex items-center justify-between border-t border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest leading-none mb-1">Total Attendance</p>
                      <p className="text-sm font-bold tracking-tight">{lecture.attendanceCount || 0} Students</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest leading-none mb-1">Session ID</p>
                    <p className="text-[10px] font-bold opacity-60">{lecture.id.slice(-6).toUpperCase()}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-5 h-5 text-ink/20" />
            </div>
            
            <div className="flex items-start justify-between mb-8">
              <div className="w-12 h-12 bg-bg border border-line rounded-2xl flex items-center justify-center group-hover:bg-ink group-hover:text-white transition-all duration-500">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="mono-data opacity-30">
                {format(new Date(lecture.createdAt), 'dd.MM.yy')}
              </span>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-ink tracking-tight leading-tight">{lecture.title}</h3>
              <p className="text-ink/40 text-xs font-mono uppercase tracking-widest">{lecture.subject}</p>
              {lecture.room && (
                <p className="text-accent text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-accent" />
                  Room {lecture.room}
                </p>
              )}
            </div>
            
            <div className="mt-8 pt-6 border-t border-line flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-ink/40">
                  <Users className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">View Records</span>
                </div>
                {lecture.startTime && (
                  <p className="text-[9px] font-mono text-ink/30 uppercase tracking-tighter">
                    {lecture.startTime} • {lecture.duration}m
                  </p>
                )}
              </div>
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="bg-white w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden border border-line"
            >
              <div className="p-8 border-b border-line flex items-center justify-between bg-bg/30">
                <div>
                  <h3 className="text-xl font-bold text-ink tracking-tighter uppercase">New Session</h3>
                  <p className="text-[10px] font-mono opacity-40 uppercase tracking-widest">Configure Lecture</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg transition-colors">
                  <X className="w-6 h-6 opacity-40" />
                </button>
              </div>
              <form onSubmit={handleCreateLecture} className="p-8 space-y-6">
                <div className="space-y-1.5">
                  <label className="col-header ml-1">Lecture Title</label>
                  <input
                    type="text"
                    required
                    value={newLecture.title}
                    onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
                    placeholder="e.g. Quantum Mechanics"
                    className="input-field"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="col-header ml-1">Subject Area</label>
                  <input
                    type="text"
                    required
                    value={newLecture.subject}
                    onChange={(e) => setNewLecture({ ...newLecture, subject: e.target.value })}
                    placeholder="e.g. Physics"
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="col-header ml-1">Date</label>
                    <input
                      type="date"
                      required
                      value={newLecture.date}
                      onChange={(e) => setNewLecture({ ...newLecture, date: e.target.value })}
                      className="input-field font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="col-header ml-1">Start Time</label>
                    <input
                      type="time"
                      required
                      value={newLecture.startTime}
                      onChange={(e) => setNewLecture({ ...newLecture, startTime: e.target.value })}
                      className="input-field font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="col-header ml-1">Duration (min)</label>
                    <input
                      type="number"
                      required
                      min="15"
                      max="300"
                      value={newLecture.duration}
                      onChange={(e) => setNewLecture({ ...newLecture, duration: parseInt(e.target.value) })}
                      className="input-field font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="col-header ml-1">Room / Location</label>
                    <input
                      type="text"
                      value={newLecture.room}
                      onChange={(e) => setNewLecture({ ...newLecture, room: e.target.value })}
                      placeholder="e.g. Lab 402"
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="col-header ml-1">QR Resolution</label>
                    <input
                      type="number"
                      required
                      min="128"
                      max="512"
                      value={newLecture.qrSize}
                      onChange={(e) => setNewLecture({ ...newLecture, qrSize: parseInt(e.target.value) })}
                      className="input-field font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="col-header ml-1">Error Correction</label>
                    <select
                      value={newLecture.qrLevel}
                      onChange={(e) => setNewLecture({ ...newLecture, qrLevel: e.target.value as any })}
                      className="input-field text-sm font-medium appearance-none"
                    >
                      <option value="L">Level L (7%)</option>
                      <option value="M">Level M (15%)</option>
                      <option value="Q">Level Q (25%)</option>
                      <option value="H">Level H (30%)</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full btn-primary mt-4 uppercase tracking-widest text-xs font-bold"
                >
                  Initialize & Generate
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {selectedLecture && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLecture(null)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-xl"
            />
            <motion.div
              layoutId={selectedLecture.id}
              className="bg-white w-full max-w-5xl rounded-[48px] shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row max-h-[90vh] border border-line"
            >
              <div className="p-12 bg-bg/50 md:w-1/2 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-line">
                <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-ink/5 mb-10 relative group border border-line">
                  <QRCodeSVG 
                    value={selectedLecture.qrCode} 
                    size={selectedLecture.qrSize || 256} 
                    level={selectedLecture.qrLevel || "H"} 
                    includeMargin 
                  />
                  <div className="hidden">
                    <QRCodeCanvas
                      id="qr-canvas"
                      value={selectedLecture.qrCode}
                      size={selectedLecture.qrSize || 256}
                      level={selectedLecture.qrLevel || "H"}
                      includeMargin
                    />
                  </div>
                  <button 
                    onClick={downloadQRCode}
                    className="absolute -bottom-4 -right-4 w-14 h-14 bg-ink text-white rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:scale-110 active:scale-95"
                    title="Download QR"
                  >
                    <ImageIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="text-center max-w-xs">
                  <h3 className="text-3xl font-bold text-ink tracking-tighter leading-none mb-2">{selectedLecture.title}</h3>
                  <p className="text-ink/40 text-xs font-mono uppercase tracking-widest mb-4">{selectedLecture.subject}</p>
                  
                  {selectedLecture.date && (
                    <div className="flex flex-col gap-1 mb-8">
                      <p className="text-[10px] font-mono text-ink/60 uppercase tracking-[0.2em]">
                        {format(new Date(selectedLecture.date), 'EEEE, MMMM do')}
                      </p>
                      <p className="text-xs font-bold text-ink">
                        {selectedLecture.startTime} • {selectedLecture.duration} Minutes
                        {selectedLecture.room && ` • Room ${selectedLecture.room}`}
                      </p>
                    </div>
                  )}

                  <div className="inline-flex items-center gap-3 text-accent bg-accent/10 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-accent/20">
                    <QrCode className="w-4 h-4" />
                    Active Scanning Protocol
                  </div>
                </div>

                <div className="mt-12 w-full max-w-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">Manual Override</h4>
                    <div className="w-1 h-1 rounded-full bg-ink/20" />
                  </div>
                  <form onSubmit={handleManualAttendance} className="space-y-4">
                    <textarea
                      placeholder="Student names (one per line)..."
                      value={manualStudentNames}
                      onChange={(e) => setManualStudentNames(e.target.value)}
                      className="w-full px-5 py-4 bg-white border border-line rounded-2xl outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent transition-all text-sm min-h-[120px] resize-none placeholder:text-ink/20 font-medium"
                    />
                    <button
                      type="submit"
                      disabled={isMarkingManual || !manualStudentNames.trim()}
                      className="w-full btn-primary py-3.5 text-[10px] uppercase tracking-widest font-bold disabled:bg-bg disabled:text-ink/20"
                    >
                      {isMarkingManual ? 'Processing...' : 'Register Students'}
                    </button>
                  </form>
                </div>
              </div>

              <div className="p-12 md:w-1/2 flex flex-col overflow-hidden bg-white">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-bg rounded-2xl flex items-center justify-center">
                      <Users className="w-6 h-6 opacity-40" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-ink tracking-tight">Attendance</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-accent font-bold">{attendance.length} REGISTERED</span>
                        {attendance.length > 0 && (
                          <button 
                            onClick={downloadCSV}
                            className="text-[10px] font-bold text-ink/30 hover:text-ink uppercase tracking-tighter transition-colors"
                          >
                            • Export CSV
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedLecture(null)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg transition-colors">
                    <X className="w-6 h-6 opacity-40" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-4 -mr-4 space-y-1">
                  <div className="flex items-center px-4 py-2 mb-2">
                    <span className="col-header flex-1">Student Identity</span>
                    <span className="col-header w-20 text-right">Time</span>
                  </div>
                  
                  {attendance.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-16 h-16 bg-bg rounded-full flex items-center justify-center mb-4 opacity-20">
                        <Users className="w-8 h-8" />
                      </div>
                      <p className="text-xs font-mono text-ink/30 uppercase tracking-widest">Waiting for entries...</p>
                    </div>
                  ) : (
                    attendance.map((record) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={record.id}
                        className="data-row rounded-xl border-none hover:scale-[1.01]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="text-green-500 w-4 h-4" />
                          </div>
                          <p className="font-bold text-sm tracking-tight">{record.studentName}</p>
                        </div>
                        <span className="mono-data opacity-40">{format(new Date(record.timestamp), 'HH:mm:ss')}</span>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
