const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/users';

export interface User {
  _id?: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
}

export const apiService = {
  async getUsers(): Promise<User[]> {
    try {
      const response = await fetch(BASE_URL);
      if (!response.ok) throw new Error('Failed to fetch users');
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async createUser(userData: User): Promise<User> {
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
};
