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
              <Link to="/join-group" className="text-white mx-2">Join Requests</Link>
              <Link to="/create-group" className="text-white mx-2">Create Group</Link>
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