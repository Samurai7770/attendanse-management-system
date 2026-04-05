import React, { useState } from 'react';
import { User } from '../types';
import { UserCircle, GraduationCap, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, role })
      });

      if (res.ok) {
        const user = await res.json();
        onLogin(user);
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="glass-card p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-ink/5" />
        
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-ink tracking-tighter uppercase">Portal Access</h2>
          <p className="text-ink/50 text-xs font-mono uppercase tracking-widest mt-2">Identification Required</p>
        </div>

        <div className="flex p-1.5 bg-bg border border-line rounded-2xl mb-10">
          <button
            onClick={() => setRole('student')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
              role === 'student' ? "bg-white text-ink shadow-sm border border-line" : "text-ink/40 hover:text-ink"
            )}
          >
            <UserCircle className="w-4 h-4" />
            Student
          </button>
          <button
            onClick={() => setRole('teacher')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
              role === 'teacher' ? "bg-white text-ink shadow-sm border border-line" : "text-ink/40 hover:text-ink"
            )}
          >
            <GraduationCap className="w-4 h-4" />
            Teacher
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="col-header ml-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="input-field"
            />
          </div>
          <div className="space-y-1.5">
            <label className="col-header ml-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@institution.edu"
              className="input-field"
            />
          </div>
          <button
            type="submit"
            className="w-full btn-primary flex items-center justify-center gap-3 group mt-4"
          >
            <span className="uppercase tracking-widest text-xs font-bold">Authenticate</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-line text-center">
          <p className="text-[10px] font-mono text-ink/30 uppercase tracking-tighter">
            Secure Attendance Protocol v2.0.4
          </p>
        </div>
      </div>
    </div>
  );
}
