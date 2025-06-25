"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"
import { CognitoUserPool } from "amazon-cognito-identity-js"
import "./App.css"
import Navbar from "./components/Navbar"
import SignIn from "./components/SignIn"
import SignUp from "./components/SignUp"
import Dashboard from "./components/Dashboard"
import JoinGroup from "./components/JoinGroup"
import CreateGroup from "./components/CreateGroup"
import Expenses from "./components/Expenses" // Add this import

const poolData = {
  UserPoolId: "us-east-1_aipNihu82",
  ClientId: "67klv34l22rqvcoqvph5lnqc0p",
}

const userPool = new CognitoUserPool(poolData)

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const cognitoUser = userPool.getCurrentUser()
    if (cognitoUser) {
      cognitoUser.getSession((err, session) => {
        if (err) {
          setUser(null)
          return
        }
        if (session.isValid()) {
          setUser({ username: cognitoUser.getUsername(), token: session.getIdToken().getJwtToken() })
        }
      })
    }
  }, [])

  const handleSignOut = () => {
    const cognitoUser = userPool.getCurrentUser()
    if (cognitoUser) {
      cognitoUser.signOut()
      setUser(null)
    }
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar user={user} onSignOut={handleSignOut} />
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/signin" element={user ? <Navigate to="/dashboard" /> : <SignIn setUser={setUser} />} />
            <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignUp />} />
            <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/signin" />} />
            <Route path="/join-group" element={user ? <JoinGroup user={user} /> : <Navigate to="/signin" />} />
            <Route path="/create-group" element={user ? <CreateGroup user={user} /> : <Navigate to="/signin" />} />
            <Route path="/expenses/:groupId" element={user ? <Expenses user={user} /> : <Navigate to="/signin" />} />
            <Route path="/" element={<Navigate to={user ? "/dashboard" : "/signin"} />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
