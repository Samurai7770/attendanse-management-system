import { useState, useEffect, useRef } from 'react';
import { User, Lecture } from '../types';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, CheckCircle2, AlertCircle, History, BookOpen, Clock, Info, UserX, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [allLectures, setAllLectures] = useState<Lecture[]>([]);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    fetchHistory();
    fetchAllLectures();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/attendance/student', { credentials: 'include' });
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllLectures = async () => {
    try {
      const res = await fetch('/api/lectures', { credentials: 'include' });
      const data = await res.json();
      setAllLectures(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (scanning) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 20, 
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.7);
            return { width: qrboxSize, height: qrboxSize };
          },
          aspectRatio: 1.0
        },
        /* verbose= */ false
      );

      scannerRef.current.render(onScanSuccess, onScanFailure);

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(error => console.error("Failed to clear scanner", error));
          scannerRef.current = null;
        }
      };
    }
  }, [scanning]);

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error("Failed to clear scanner", err);
      }
    }
    setScanning(false);
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

  const onScanSuccess = async (decodedText: string) => {
    stopScanning();
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          qrCode: decodedText
        })
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: `Attendance marked successfully!` });
        fetchHistory();
      } else {
        setStatus({ type: 'error', message: data.message || 'Failed to mark attendance' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Something went wrong' });
    }
  };

  const onScanFailure = (error: any) => {
    // console.warn(`Code scan error = ${error}`);
  };

  const absentLectures = allLectures.filter(l => !history.some(h => h.lectureId === l.id));

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <div className="glass-card p-12 text-center relative overflow-hidden border-none shadow-2xl shadow-ink/5">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-accent/20" />
        
        <AnimatePresence>
          {scanning && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 bg-ink text-white py-2 px-6 rounded-full flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest z-50 shadow-xl"
            >
              <Info className="w-3.5 h-3.5 text-accent" />
              Align QR Code within Frame
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-20 h-20 bg-bg border border-line rounded-[32px] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
          <Camera className="text-ink/40 w-10 h-10" />
        </div>
        
        <div className="max-w-md mx-auto mb-10">
          <h2 className="text-3xl font-bold text-ink tracking-tighter uppercase mb-3">Attendance Check-in</h2>
          <p className="text-ink/40 text-xs font-mono uppercase tracking-widest leading-relaxed">
            Synchronize your presence by scanning the session QR code provided by your instructor.
          </p>
        </div>

        {!scanning ? (
          <button
            onClick={() => {
              setScanning(true);
              setStatus(null);
            }}
            className="btn-primary flex items-center gap-4 mx-auto px-10 py-5 group"
          >
            <Camera className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="uppercase tracking-widest text-sm font-bold">Initialize Scanner</span>
          </button>
        ) : (
          <div className="space-y-6 max-w-sm mx-auto">
            <div id="reader" className="overflow-hidden rounded-[32px] border-4 border-bg shadow-inner bg-bg"></div>
            <button
              onClick={stopScanning}
              className="text-ink/30 font-bold uppercase tracking-widest text-[10px] hover:text-red-500 transition-colors"
            >
              Terminate Session
            </button>
          </div>
        )}

        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`mt-10 p-6 rounded-3xl flex items-center gap-4 text-left border ${
                status.type === 'success' 
                ? 'bg-green-500/5 text-green-700 border-green-500/20' 
                : 'bg-red-500/5 text-red-700 border-red-500/20'
              }`}
            >
              <div className={`p-2 rounded-xl ${status.type === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest opacity-50 mb-0.5">System Response</p>
                <p className="font-bold tracking-tight">{status.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleLogout}
          className="btn-secondary flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="uppercase tracking-widest text-xs font-bold">Logout</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-bold text-ink/40 uppercase tracking-widest flex items-center gap-3">
              <History className="w-4 h-4" />
              Activity Log
            </h3>
            <span className="text-[10px] font-mono opacity-30">{history.length} ENTRIES</span>
          </div>
          
          <div className="space-y-2">
            {history.length === 0 ? (
              <div className="glass-card p-12 text-center border-dashed">
                <Clock className="w-10 h-10 mx-auto mb-4 opacity-10" />
                <p className="text-[10px] font-mono text-ink/30 uppercase tracking-widest">No records found</p>
              </div>
            ) : (
              history.map((record: { id: any; lectureTitle: any; subject: any; room: any; timestamp: string | number | Date; }, i: number) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={record.id}
                  className="data-row rounded-2xl border-none bg-white hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-bg rounded-xl flex items-center justify-center">
                      <BookOpen className="text-ink/20 w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-ink text-sm tracking-tight leading-none mb-1">{record.lectureTitle}</h4>
                      <p className="text-[10px] font-mono text-ink/40 uppercase tracking-tighter">
                        {record.subject} {record.room && `• Room ${record.room}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-accent mono-data">{format(new Date(record.timestamp), 'HH:mm')}</p>
                    <p className="text-[9px] text-ink/30 uppercase font-mono tracking-tighter">{format(new Date(record.timestamp), 'dd MMM')}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-bold text-ink/40 uppercase tracking-widest flex items-center gap-3">
              <UserX className="w-4 h-4 text-accent-warm" />
              Absence Alerts
            </h3>
            <span className="text-[10px] font-mono opacity-30">{absentLectures.length} MISSED</span>
          </div>

          <div className="space-y-2">
            {absentLectures.length === 0 ? (
              <div className="glass-card p-12 text-center border-dashed">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-4 text-green-500/20" />
                <p className="text-[10px] font-mono text-ink/30 uppercase tracking-widest">Compliance 100%</p>
              </div>
            ) : (
              absentLectures.map((lecture, i) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={lecture.id}
                  className="data-row rounded-2xl border-none bg-white hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-500/5 rounded-xl flex items-center justify-center">
                      <BookOpen className="text-red-500/20 w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-ink text-sm tracking-tight leading-none mb-1">{lecture.title}</h4>
                      <p className="text-[10px] font-mono text-ink/40 uppercase tracking-tighter">
                        {lecture.subject} {lecture.room && `• Room ${lecture.room}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-accent-warm bg-accent-warm/10 px-2 py-1 rounded-lg uppercase tracking-widest border border-accent-warm/20">
                      Unrecorded
                    </span>
                    <p className="text-[9px] text-ink/30 mt-1.5 font-mono">{format(new Date(lecture.createdAt), 'dd.MM.yy')}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
