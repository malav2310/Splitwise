import React, { useState } from 'react';
import axios from 'axios';

const apiUrl = 'YOUR_API_GATEWAY_URL'; // Replace after deployment

function CreateGroup({ user }) {
  const [groupName, setGroupName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/create_group`, { group_name: groupName }, {
        headers: { Authorization: user.token }
      });
      setMessage(`Group created: ${response.data.group_id}`);
      setGroupName('');
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Create Group</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Group Name</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white p-2 rounded w-full">Create</button>
      </form>
      <p className="mt-4 text-red-600">{message}</p>
    </div>
  );
}

export default CreateGroup;