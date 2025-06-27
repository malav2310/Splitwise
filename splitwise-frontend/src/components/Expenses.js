"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useParams, useNavigate } from "react-router-dom"

const API_BASE_URL = "https://sidvpohuge.execute-api.us-east-1.amazonaws.com/prod"
const USE_MOCK_DATA = false

const mockExpenses = [
  {
    expense_id: "exp_001",
    description: "Hotel booking",
    amount: 450.0,
    paid_by: "user1@example.com",
    split_among: ["user1@example.com", "user2@example.com", "user3@example.com"],
    date: "2024-01-15",
    category: "Accommodation",
  },
  {
    expense_id: "exp_002",
    description: "Dinner at restaurant",
    amount: 85.5,
    paid_by: "user2@example.com",
    split_among: ["user1@example.com", "user2@example.com"],
    date: "2024-01-16",
    category: "Food",
  },
  {
    expense_id: "exp_003",
    description: "Gas for road trip",
    amount: 65.25,
    paid_by: "user3@example.com",
    split_among: ["user1@example.com", "user2@example.com", "user3@example.com"],
    date: "2024-01-17",
    category: "Transportation",
  },
  {
    expense_id: "exp_004",
    description: "Groceries",
    amount: 120.75,
    paid_by: "user1@example.com",
    split_among: ["user1@example.com", "user2@example.com", "user3@example.com", "user4@example.com"],
    date: "2024-01-18",
    category: "Food",
  },
]

const mockGroupInfo = {
  group_name: "Beach Vacation",
  members: [
    { user_id: "user1@example.com", role: "admin" },
    { user_id: "user2@example.com", role: "member" },
    { user_id: "user3@example.com", role: "member" },
  ],
}

const Expenses = ({ user }) => {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const [expenses, setExpenses] = useState([])
  const [groupInfo, setGroupInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")

  // Add Expense Modal State
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "Food",
    split_among: [],
  })
  const [addingExpense, setAddingExpense] = useState(false)

  // Invite User Modal State
  const [showInviteUser, setShowInviteUser] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [invitingUser, setInvitingUser] = useState(false)

  useEffect(() => {
    const fetchExpensesAndGroupInfo = async () => {
      setLoading(true)

      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setExpenses(mockExpenses)
        setGroupInfo(mockGroupInfo)
        setNewExpense((prev) => ({
          ...prev,
          split_among: mockGroupInfo.members.map((m) => m.user_id),
        }))
        setLoading(false)
        return
      }

      try {
        const token = user.token

        // Fetch expenses
        const expensesResponse = await axios.post(
          `${API_BASE_URL}/get_expenses`,
          { group_id: groupId },
          { headers: { Authorization: `Bearer ${token}` } },
        )

        // Fetch group info
        const groupResponse = await axios.post(
          `${API_BASE_URL}/get_groups`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        )

        const currentGroup = groupResponse.data.groups?.find((g) => g.GroupId === groupId)

        setExpenses(expensesResponse.data.expenses || [])
        setGroupInfo(currentGroup)

        if (currentGroup) {
          setNewExpense((prev) => ({
            ...prev,
            split_among: currentGroup.members.map((m) => m.user_id),
          }))
        }
      } catch (err) {
        setMessage(`Error: ${err.response?.data?.error || err.message}`)
        setMessageType("error")
      } finally {
        setLoading(false)
      }
    }

    if (groupId && user) {
      fetchExpensesAndGroupInfo()
    }
  }, [groupId, user])

  const handleAddExpense = async (e) => {
    e.preventDefault()
    setAddingExpense(true)

    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const mockNewExpense = {
        expense_id: `exp_${Date.now()}`,
        description: newExpense.description,
        amount: Number.parseFloat(newExpense.amount),
        paid_by: user.email || "user1@example.com",
        split_among: newExpense.split_among,
        date: new Date().toISOString().split("T")[0],
        category: newExpense.category,
      }
      setExpenses((prev) => [mockNewExpense, ...prev])
      setMessage("Expense added successfully!")
      setMessageType("success")
      setShowAddExpense(false)
      setNewExpense({
        description: "",
        amount: "",
        category: "Food",
        split_among: groupInfo.members.map((m) => m.user_id),
      })
      setAddingExpense(false)
      return
    }

    try {
      const token = (await window.Amplify.Auth.currentSession()).getIdToken().getJwtToken()
      const response = await axios.post(
        `${API_BASE_URL}/add_expense`,
        {
          group_id: groupId,
          description: newExpense.description,
          amount: Number.parseFloat(newExpense.amount),
          category: newExpense.category,
          split_among: newExpense.split_among,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      setMessage("Expense added successfully!")
      setMessageType("success")
      setShowAddExpense(false)
      setNewExpense({
        description: "",
        amount: "",
        category: "Food",
        split_among: groupInfo.members.map((m) => m.user_id),
      })

      // Refresh expenses
      const expensesResponse = await axios.post(
        `${API_BASE_URL}/get_expenses`,
        { group_id: groupId },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setExpenses(expensesResponse.data.expenses || [])
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.error || err.message}`)
      setMessageType("error")
    } finally {
      setAddingExpense(false)
    }
  }

  const handleInviteUser = async (e) => {
    e.preventDefault()
    setInvitingUser(true)

    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setMessage(`Invitation sent to ${inviteEmail}!`)
      setMessageType("success")
      setShowInviteUser(false)
      setInviteEmail("")
      setInvitingUser(false)
      return
    }

    try {
      const token = user.token
      const response = await axios.post(
        `${API_BASE_URL}/invite_user`,
        {
          group_id: groupId,
          invitee_email: inviteEmail,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      setMessage(`Invitation sent to ${inviteEmail}!`)
      setMessageType("success")
      setShowInviteUser(false)
      setInviteEmail("")
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.error || err.message}`)
      setMessageType("error")
    } finally {
      setInvitingUser(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getCategoryIcon = (category) => {
    const icons = {
      Food: "🍽️",
      Transportation: "🚗",
      Accommodation: "🏨",
      Entertainment: "🎬",
      Shopping: "🛍️",
      Other: "📝",
    }
    return icons[category] || icons.Other
  }

  const handleSplitToggle = (userId) => {
    setNewExpense((prev) => ({
      ...prev,
      split_among: prev.split_among.includes(userId)
        ? prev.split_among.filter((id) => id !== userId)
        : [...prev.split_among, userId],
    }))
  }

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{groupInfo?.group_name || "Group Expenses"}</h1>
          </div>
          <p className="text-gray-600">
            {expenses.length} expense{expenses.length !== 1 ? "s" : ""} • {groupInfo?.members?.length || 0} member
            {groupInfo?.members?.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowAddExpense(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Expense
          </button>
          <button
            onClick={() => setShowInviteUser(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Invite User
          </button>
        </div>
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

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-16 px-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No expenses yet</h3>
          <p className="text-gray-600">Start by adding your first expense to this group!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div
              key={expense.expense_id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getCategoryIcon(expense.category)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{expense.description}</h3>
                        <p className="text-sm text-gray-600">{expense.category}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                      <span>
                        Paid by <strong>{expense.paid_by}</strong>
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span>
                        Split among {expense.split_among.length} member{expense.split_among.length !== 1 ? "s" : ""}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span>{formatDate(expense.date)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">${expense.amount.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">
                      ${(expense.amount / expense.split_among.length).toFixed(2)} per person
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Add New Expense</h2>
                <button onClick={() => setShowAddExpense(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    required
                    value={newExpense.description}
                    onChange={(e) => setNewExpense((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What was this expense for?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense((prev) => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Food">Food</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Accommodation">Accommodation</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Split among</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {groupInfo?.members?.map((member) => (
                      <label key={member.user_id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newExpense.split_among.includes(member.user_id)}
                          onChange={() => handleSplitToggle(member.user_id)}
                          className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{member.user_id}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddExpense(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingExpense}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {addingExpense ? "Adding..." : "Add Expense"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Invite User</h2>
                <button onClick={() => setShowInviteUser(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleInviteUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="user@example.com"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInviteUser(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={invitingUser}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {invitingUser ? "Sending..." : "Send Invite"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Expenses
