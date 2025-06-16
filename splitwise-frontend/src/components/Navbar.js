import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ user, onSignOut }) {
  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">Splitwise</Link>
        <div>
          {user ? (
            <>
              <Link to="/dashboard" className="text-white mx-2">Dashboard</Link>
              <Link to="/create-group" className="text-white mx-2">Create Group</Link>
              <Link to="/add-expense" className="text-white mx-2">Add Expense</Link>
              <Link to="/view-balances" className="text-white mx-2">View Balances</Link>
              <button onClick={onSignOut} className="text-white mx-2">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/signin" className="text-white mx-2">Sign In</Link>
              <Link to="/signup" className="text-white mx-2">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;