import { useState, useEffect } from 'react';
import { User, Lecture } from './types';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import Login from './components/Login';
import { LogOut, GraduationCap, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in local storage
    const savedUser = localStorage.getItem('qr_attendance_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setUser(user);
    localStorage.setItem('qr_attendance_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('qr_attendance_user');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ink"></div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-bg text-ink font-sans selection:bg-accent/30">
      <header className="bg-white/80 backdrop-blur-md border-b border-line sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-ink p-2.5 rounded-2xl shadow-lg shadow-ink/10">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col -space-y-1">
              <h1 className="text-lg font-bold tracking-tighter text-ink uppercase">
                Attendance
              </h1>
              <span className="text-[10px] font-mono opacity-50 tracking-widest uppercase">System v2.0</span>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold leading-none">{user.name}</p>
                  <p className="text-[10px] font-mono opacity-50 uppercase tracking-tighter mt-1">{user.role}</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-bg border border-line flex items-center justify-center">
                  <UserCircle className="w-6 h-6 opacity-40" />
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 text-ink/40 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
            >
              <Login onLogin={handleLogin} />
            </motion.div>
          ) : user.role === 'teacher' ? (
            <motion.div
              key="teacher"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <TeacherDashboard user={user} onLogout={handleLogout} />
            </motion.div>
          ) : (
            <motion.div
              key="student"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <StudentDashboard user={user} onLogout={handleLogout} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
    </>
  );
}

