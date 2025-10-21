import React, { useEffect, useState } from "react";
import axios from "./AxiosInstance"; // assuming you're using one
import { useNavigate } from "react-router-dom";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/register/users").then((res) => setUsers(res.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">User Management</h1>
      <table className="table w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Assign Sites</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name} {u.surname}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                {u.role === "client" ? (
                  <button
                    className="btn btn-sm btn-accent"
                    onClick={() => navigate(`/register/users/${u.id}/sites`)}
                  >
                    Assign Sites
                  </button>
                ) : (
                  <span className="text-gray-400 italic">N/A</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
