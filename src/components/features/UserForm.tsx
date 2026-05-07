'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { apiService, User } from '@/src/services/api';

interface UserFormProps {
  onUserCreated: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({ onUserCreated }) => {
  const [formData, setFormData] = useState<User>({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiService.createUser(formData);
      setFormData({ name: '', email: '' });
      onUserCreated();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Create New User</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Full Name"
          placeholder="Enter user name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="user@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
        <Button type="submit" isLoading={loading} className="w-full">
          Add User
        </Button>
      </form>
    </Card>
  );
};
