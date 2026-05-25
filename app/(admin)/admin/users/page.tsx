"use client";

import { useEffect, useState } from "react";

import {
  getAllUsersAdmin,
  deleteUserAdmin,
  updateUserStatusAdmin,
} from "@/src/services/adminService";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsersAdmin();
      setUsers(data.users);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (id: string, current: boolean) => {
    try {
      await updateUserStatusAdmin(id, !current);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteHandler = async (id: string) => {
    const ok = confirm("Delete user?");

    if (!ok) return;

    try {
      await deleteUserAdmin(id);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Users
      </h1>

      <div className="bg-white rounded-2xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Role</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-t"
              >
                <td className="p-4">
                  {user.name}
                </td>

                <td className="p-4">
                  {user.email}
                </td>

                <td className="p-4 capitalize">
                  {user.role}
                </td>

                <td className="p-4">
                  {user.status ? "Active" : "Banned"}
                </td>

                <td className="p-4 flex gap-2">

                  <button
                    onClick={() =>
                      toggleStatus(user._id, user.status)
                    }
                    className="px-4 py-2 rounded-lg bg-yellow-500 text-white"
                  >
                    {user.status ? "Ban" : "Unban"}
                  </button>

                  <button
                    onClick={() =>
                      deleteHandler(user._id)
                    }
                    className="px-4 py-2 rounded-lg bg-red-500 text-white"
                  >
                    Delete
                  </button>

                </td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>
    </div>
  );
}