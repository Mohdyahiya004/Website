import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Failed to load users: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      alert("User role updated successfully!");
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role: " + error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading users...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-amber-900 mb-8">
        👥 All Registered Users
      </h1>

      {users.length === 0 ? (
        <p className="text-center text-gray-500">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 bg-white shadow-md rounded-lg">
            <thead className="bg-amber-900 text-white">
              <tr>
                <th className="py-3 px-4 border">#</th>
                <th className="py-3 px-4 border text-left">Email</th>
                <th className="py-3 px-4 border text-left">Mobile</th>
                <th className="py-3 px-4 border text-left">Role</th>
                <th className="py-3 px-4 border text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-100">
                  <td className="py-3 px-4 border text-center">{index + 1}</td>
                  <td className="py-3 px-4 border">{user.email}</td>
                  <td className="py-3 px-4 border">
                    {user.MobileNumber || "Not Provided"}
                  </td>
                  <td className="py-3 px-4 border capitalize">{user.role}</td>
                  <td className="py-3 px-4 border text-center">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      className="border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
