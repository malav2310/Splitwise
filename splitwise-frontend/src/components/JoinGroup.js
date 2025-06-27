"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js'
import userPool from '../utils/userPool'

const API_BASE_URL = "https://sidvpohuge.execute-api.us-east-1.amazonaws.com/prod"
const USE_MOCK_DATA = false
console.log("hello world from join group")
const mockPendingInvites = [
  {
    GroupId: "123e4567-e89b-12d3-a456-426614174000",
    group_name: "Beach Vacation",
    members: [
      { user_id: "user1@example.com", pending: true, role: "member" },
      { user_id: "user2@example.com", pending: false, role: "admin" },
    ],
  },
  {
    GroupId: "789a123b-cdef-4567-8901-234567890123",
    group_name: "Ski Trip",
    members: [
      { user_id: "user3@example.com", pending: true, role: "member" },
      { user_id: "user4@example.com", pending: false, role: "admin" },
    ],
  },
  {
    GroupId: "456b789c-def0-1234-5678-901234567890",
    group_name: "Book Club",
    members: [
      { user_id: "user5@example.com", pending: true, role: "member" },
      { user_id: "user6@example.com", pending: false, role: "admin" },
      { user_id: "user7@example.com", pending: false, role: "member" },
    ],
  },
]

const JoinGroup = ({ user }) => {
  const [pendingInvites, setPendingInvites] = useState([])
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")
  const [loading, setLoading] = useState(true)
  const [joiningGroups, setJoiningGroups] = useState(new Set())
  const navigate = useNavigate()


  useEffect(() => {
    const fetchPendingInvites = async () => {
      setLoading(true)
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setPendingInvites(mockPendingInvites)
        setLoading(false)
        return
      }

      try {
        console.log(user.username)        
        const token = user.token

        const response = await axios.get(
          `${API_BASE_URL}/get_groups`,
          { params: { pending: true }, headers: { Authorization: `Bearer ${token}` } }
        )
        setPendingInvites(response.data.groups || [])
      } catch (err) {
        setMessage(`Error: ${err.response?.data?.error || err.message}`)
        setMessageType("error")
      } finally {
        setLoading(false)
      }
    }

    if (user?.username) {
      fetchPendingInvites()
    }
  }, [user])

  const handleJoinGroup = async (groupId) => {
    setJoiningGroups((prev) => new Set(prev).add(groupId))

    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setMessage("Successfully joined group!")
      setMessageType("success")
      setPendingInvites(pendingInvites.filter((g) => g.GroupId !== groupId))
      setTimeout(() => navigate("/dashboard"), 2000)
      setJoiningGroups((prev) => {
        const newSet = new Set(prev)
        newSet.delete(groupId)
        return newSet
      })
      return
    }

    try {

      const token = user.token

      const response = await axios.post(
        `${API_BASE_URL}/join_group`,
        { group_id: groupId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessage(response.data.message || "Successfully joined group!")
      setMessageType("success")
      setPendingInvites(pendingInvites.filter((g) => g.GroupId !== groupId))
      setTimeout(() => navigate("/dashboard"), 2000)
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.error || err.message}`)
      setMessageType("error")
    } finally {
      setJoiningGroups((prev) => {
        const newSet = new Set(prev)
        newSet.delete(groupId)
        return newSet
      })
    }
  }

  const getActiveMembersCount = (members) => {
    return members.filter((member) => !member.pending).length
  }

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="h-8 w-64 bg-gray-200 rounded-lg mx-auto animate-pulse"></div>
        <div className="h-4 w-48 bg-gray-200 rounded mx-auto animate-pulse"></div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Group Invitations</h1>
        </div>
        <p className="text-gray-600">
          You have {pendingInvites.length} pending group invitation{pendingInvites.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`rounded-lg p-4 flex items-center gap-3 ${
            messageType === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          }`}
        >
          <div className={`w-5 h-5 ${messageType === "success" ? "text-green-600" : "text-red-600"}`}>
            {messageType === "success" ? (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>
          <p className={messageType === "success" ? "text-green-800" : "text-red-800"}>{message}</p>
        </div>
      )}

      {/* Empty State */}
      {pendingInvites.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-16 px-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending invitations</h3>
          <p className="text-gray-600">You're all caught up! Check back later for new group invitations.</p>
        </div>
      ) : (
        /* Group Cards */
        <div className="space-y-4">
          {pendingInvites.map((group) => (
            <div
              key={group.GroupId}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <div className="p-6">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-gray-900">{group.group_name}</h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                      <span className="text-sm">
                        {getActiveMembersCount(group.members)} active member
                        {getActiveMembersCount(group.members) !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Pending
                  </span>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">Group ID: {group.GroupId.slice(0, 8)}...</div>
                  <button
                    onClick={() => handleJoinGroup(group.GroupId)}
                    disabled={joiningGroups.has(group.GroupId)}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      joiningGroups.has(group.GroupId)
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
                    }`}
                  >
                    {joiningGroups.has(group.GroupId) ? (
                      <>
                        <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Joining...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Join Group
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default JoinGroup