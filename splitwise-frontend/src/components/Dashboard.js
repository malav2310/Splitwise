import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiUrl = 'YOUR_API_GATEWAY_URL'; // Replace after deployment

function Dashboard({ user }) {
  const [groups, setGroups] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${apiUrl}/get_groups`, {
          headers: { Authorization: user.token }
        });
        setGroups(response.data.groups || []);
      } catch (err) {
        setMessage(`Error: ${err.response?.data?.error || err.message}`);
      }
    };
    fetchGroups();
  }, [user.token]);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Dashboard</h2>
      <h3 className="text-xl mb-2">Your Groups</h3>
      {groups.length === 0 ? (
        <p>No groups found. Create one!</p>
      ) : (
        <ul className="list-disc pl-5">
          {groups.map((group) => (
            <li key={group.group_id}>{group.group_name}</li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-red-600">{message}</p>
    </div>
  );
}

export default Dashboard;