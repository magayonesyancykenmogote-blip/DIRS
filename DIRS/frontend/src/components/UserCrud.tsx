import { useEffect, useState } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export function UserCrud() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
      setError(null);
    } catch {
      setError("Could not load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to create user");
      }
      setName("");
      setEmail("");
      setRole("user");
      await loadUsers();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Submit failed";
      setError(message);
    }
  };

  const deleteUser = async (id: string) => {
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    await loadUsers();
  };

  return (
    <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
      <h3 className="text-lg font-bold mb-2">User CRUD (MongoDB)</h3>
      <form onSubmit={handleSubmit} className="space-y-2 mb-4">
        <div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="border p-2 w-full" required />
        </div>
        <div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border p-2 w-full" required />
        </div>
        <div>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="border p-2 w-full">
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded">Add User</button>
      </form>

      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading && <div>Loading...</div>}
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u._id} className="border rounded p-2 flex justify-between items-center">
            <div>
              <div className="font-semibold">{u.name}</div>
              <div className="text-xs text-gray-600">{u.email} • {u.role}</div>
            </div>
            <button onClick={() => deleteUser(u._id)} className="text-red-600">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
