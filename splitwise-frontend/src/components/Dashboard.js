"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

const API_BASE_URL = "https://0tao54qjx0.execute-api.us-east-1.amazonaws.com/prod"
const USE_MOCK_DATA = true

const mockGroups = [
  {
    GroupId: "123e4567-e89b-12d3-a456-426614174000",
    group_name: "Beach Vacation",
    members: [
      { user_id: "user1@example.com", pending: false, role: "member" },
      { user_id: "user2@example.com", pending: false, role: "admin" },
      { user_id: "user3@example.com", pending: false, role: "member" },
    ],
  },
  {
    GroupId: "789a123b-cdef-4567-8901-234567890123",
    group_name: "Ski Trip",
    members: [
      { user_id: "user1@example.com", pending: false, role: "member" },
      { user_id: "user4@example.com", pending: false, role: "admin" },
    ],
  },
  {
    GroupId: "456b789c-def0-1234-5678-901234567890",
    group_name: "Book Club",
    members: [
      { user_id: "user1@example.com", pending: false, role: "admin" },
      { user_id: "user5@example.com", pending: false, role: "member" },
      { user_id: "user6@example.com", pending: false, role: "member" },
      { user_id: "user7@example.com", pending: false, role: "member" },
    ],
  },
]

const mockBalances = {
  "123e4567-e89b-12d3-a456-426614174000": { balance: -45.5, type: "owing" }, // User owes money
  "789a123b-cdef-4567-8901-234567890123": { balance: 23.75, type: "lending" }, // User is owed money
  "456b789c-def0-1234-5678-901234567890": { balance: 0, type: "settled" }, // All settled
}

const Dashboard = ({ user }) => {
  const [groups, setGroups] = useState([])
  const [balances, setBalances] = useState({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchGroupsAndBalances = async () => {
      setLoading(true)

      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setGroups(mockGroups)
        setBalances(mockBalances)
        setLoading(false)
        return
      }

      try {
        const token = (await window.Amplify.Auth.currentSession()).getIdToken().getJwtToken()

        // Fetch user's groups
        const groupsResponse = await axios.post(
          `${API_BASE_URL}/get_groups`,
          { pending: false }, // Get only joined groups
          { headers: { Authorization: `Bearer ${token}` } },
        )

        const userGroups = groupsResponse.data.groups || []
        setGroups(userGroups)

        // Fetch balances for each group
        const balancePromises = userGroups.map(async (group) => {
          try {
            const balanceResponse = await axios.post(
              `${API_BASE_URL}/balance_query`,
              { group_id: group.GroupId },
              { headers: { Authorization: `Bearer ${token}` } },
            )
            return {
              groupId: group.GroupId,
              balance: balanceResponse.data.balance || 0,
              type:
                balanceResponse.data.balance > 0 ? "lending" : balanceResponse.data.balance < 0 ? "owing" : "settled",
            }
          } catch (err) {
            console.error(`Error fetching balance for group ${group.GroupId}:`, err)
            return { groupId: group.GroupId, balance: 0, type: "settled" }
          }
        })

        const balanceResults = await Promise.all(balancePromises)
        const balanceMap = {}
        balanceResults.forEach((result) => {
          balanceMap[result.groupId] = {
            balance: result.balance,
            type: result.type,
          }
        })
        setBalances(balanceMap)
      } catch (err) {
        setMessage(`Error: ${err.response?.data?.error || err.message}`)
        setMessageType("error")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchGroupsAndBalances()
    }
  }, [user])

  const handleGroupClick = (groupId) => {
    // Navigate to expenses page with group ID
    navigate(`/expenses/${groupId}`)
  }

  const getBalanceDisplay = (groupId) => {
    const balance = balances[groupId]
    if (!balance || balance.balance === 0) {
      return { text: "All settled", color: "text-gray-600", bgColor: "bg-gray-100" }
    }

    if (balance.type === "owing") {
      return {
        text: `You owe $${Math.abs(balance.balance).toFixed(2)}`,
        color: "text-red-700",
        bgColor: "bg-red-50 border-red-200",
      }
    } else {
      return {
        text: `You are owed $${balance.balance.toFixed(2)}`,
        color: "text-green-700",
        bgColor: "bg-green-50 border-green-200",
      }
    }
  }

  const getActiveMembersCount = (members) => {
    return members.filter((member) => !member.pending).length
  }

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="h-8 w-48 bg-gray-200 rounded-lg mx-auto animate-pulse"></div>
        <div className="h-4 w-64 bg-gray-200 rounded mx-auto animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              <div className="h-8 w-full bg-gray-200 rounded-lg animate-pulse"></div>
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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">My Groups</h1>
        </div>
        <p className="text-gray-600">
          You are part of {groups.length} group{groups.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Error Message */}
      {message && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-5 h-5 text-red-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-red-800">{message}</p>
        </div>
      )}

      {/* Empty State */}
      {groups.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-16 px-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No groups yet</h3>
          <p className="text-gray-600">Join or create a group to start tracking expenses with friends!</p>
        </div>
      ) : (
        /* Groups Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => {
            const balanceInfo = getBalanceDisplay(group.GroupId)
            return (
              <div
                key={group.GroupId}
                onClick={() => handleGroupClick(group.GroupId)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
              >
                <div className="p-6">
                  {/* Group Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {group.group_name}
                      </h3>
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
                          {getActiveMembersCount(group.members)} member
                          {getActiveMembersCount(group.members) !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>

                  {/* Balance Display */}
                  <div className={`rounded-lg p-3 border ${balanceInfo.bgColor}`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${balanceInfo.color}`}>{balanceInfo.text}</span>
                      {balances[group.GroupId]?.type === "owing" && (
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                      )}
                      {balances[group.GroupId]?.type === "lending" && (
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                      {balances[group.GroupId]?.type === "settled" && (
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Click indicator */}
                  <div className="mt-4 flex items-center justify-center text-gray-400 text-sm">
                    <span>Click to view expenses</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Dashboard
