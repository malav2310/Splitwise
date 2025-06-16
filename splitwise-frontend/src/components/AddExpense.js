import React, { useState } from 'react';
import axios from 'axios';

const apiUrl = 'YOUR_API_GATEWAY_URL'; // Replace after deployment

function AddExpense({ user }) {
  const [groupId, setGroupId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/add_expense`, {
        group_id: groupId,
        amount: parseFloat(amount),
        description
      }, {
        headers: { Authorization: user.token }
      });
      setMessage(`Expense added: ${response.data.expense_id}`);
      setGroupId('');
      setAmount('');
      setDescription('');
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Add Expense</h2>
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
        <div className="mb-4">
          <label className="block mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white p-2 rounded w-full">Add</button>
      </form>
      <p className="mt-4 text-red-600">{message}</p>
    </div>
  );
}

export default AddExpense;