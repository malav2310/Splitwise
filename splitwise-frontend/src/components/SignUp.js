import React, { useState } from 'react';
import userPool from '../utils/userPool';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
  e.preventDefault();

  
  const username = `${Date.now()}${Math.random()}`; // Example of generating a unique username

  userPool.signUp(username, password, [{ Name: 'email', Value: email }], null, (err, result) => {
    if (err) {
      setMessage(`Error: ${err.message}`);
      return;
    }
    setMessage('Sign-up successful! Please check your email to confirm.');
  });
};


  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white p-2 rounded w-full">Sign Up</button>
      </form>
      <p className="mt-4 text-red-600">{message}</p>
    </div>
  );
}

export default SignUp;