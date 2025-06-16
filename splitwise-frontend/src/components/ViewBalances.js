import React, { useState } from 'react';
import axios from 'axios';

const apiUrl = 'YOUR_API_GATEWAY_URL'; // Replace after deployment

function ViewBalances({ user }) {
  const [groupId, setGroupId] = useState('');
  const [balances, setBalances] = useState([]);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`${apiUrl}/get_balances?group_id=${groupId}`, {
        headers: { Authorization: user.token }
      });
      setBalances(response.data.balances || []);
      setMessage('Balances fetched successfully.');
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4">View Balances</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Group ID</label>
          <input
            type="text"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white p-2 rounded w-full">View</button>
      </form>
      {balances.length > 0 && (
        <ul className="mt-4 list-disc pl-5">
          {balances.map((balance, index) => (
            <li key={index}>{balance.user_id}: ${balance.amount.toFixed(2)}</li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-red-600">{message}</p>
    </div>
  );
}

export default ViewBalances;