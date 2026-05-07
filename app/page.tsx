'use client';

import React, { useState } from 'react';
import { UserForm } from '@/src/components/features/UserForm';
import { UserList } from '@/src/components/features/UserList';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUserCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen gradient-bg p-6 md:p-12 lg:p-20 flex flex-col items-center">
      {/* Header Section */}
      <header className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between mb-16 gap-8 animate-fade-in">
        <div className="text-center md:text-left">
          <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
            Learning<span className="text-primary">Portal</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md">
            Manage your users and learning environment with our professional dashboard interface.
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-4 border-background bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} 
                  alt="avatar" 
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900 dark:text-white">Active Mentors</span>
            <span className="text-xs text-slate-500">Join 500+ educators</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-6xl grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Left Column: Form */}
        <section className="xl:col-span-4 flex flex-col gap-8">
          <div className="sticky top-12">
            <UserForm onUserCreated={handleUserCreated} />
            
            <div className="mt-8 p-6 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 overflow-hidden relative group">
              <div className="relative z-10">
                <h3 className="font-bold text-xl mb-2">Pro Feature</h3>
                <p className="text-indigo-100 text-sm mb-4">Unlock advanced analytics and course management tools.</p>
                <button className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors">
                  Upgrade Now
                </button>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            </div>
          </div>
        </section>

        {/* Right Column: List */}
        <section className="xl:col-span-8">
          <UserList refreshTrigger={refreshTrigger} />
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-slate-200 dark:border-slate-800 w-full max-w-6xl flex justify-between items-center text-slate-500 text-sm">
        <p>© 2026 LearningPortal API Testing. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-primary transition-colors">Documentation</a>
          <a href="#" className="hover:text-primary transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
}

