'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '../ui/Card';
import { apiService, User } from '@/src/services/api';

export const UserList: React.FC<{ refreshTrigger: number }> = ({ refreshTrigger }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, refreshTrigger]);

  if (loading && users.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Registered Users</h2>
        <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-bold">
          {users.length} Total
        </span>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-900/10">
          <p className="text-red-500 font-medium">{error}</p>
        </Card>
      )}

      {!loading && users.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-12 text-slate-500">
          <p className="text-lg">No users found yet.</p>
          <p className="text-sm">Add one using the form above!</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user._id} className="hover:scale-[1.02] transition-transform cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-bold text-xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{user.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{user.email}</p>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span>Member since</span>
              <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recent'}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
