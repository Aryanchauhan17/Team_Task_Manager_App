import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import API from '../api/axios'
import { useAuth } from '../context/AuthContext'

const priorityColors = {
  high: 'bg-red-500/20 text-red-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  low: 'bg-gray-700 text-gray-400',
}

const statusColors = {
  todo: 'bg-gray-700 text-gray-400',
  'in-progress': 'bg-blue-500/20 text-blue-400',
  done: 'bg-green-500/20 text-green-400',
}

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '' })
  const [memberEmail, setMemberEmail] = useState('')
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const isOwner = project?.owner?.id === user?.id

  const fetchProject = async () => {
    try {
      const res = await API.get(`/projects/${id}`)
      setProject(res.data.project)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/projects/${id}/tasks`)
      setTasks(res.data.tasks)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProject()
    fetchTasks()
  }, [id])

  const handleCreateTask = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await API.post(`/projects/${id}/tasks`, taskForm)
      setTaskForm({ title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '' })
      setShowTaskModal(false)
      fetchTasks()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task')
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await API.post(`/projects/${id}/members`, { userId: memberEmail })
      setMemberEmail('')
      setShowMemberModal(false)
      fetchProject()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member')
    }
  }

  const handleStatusChange = async (taskId, status) => {
    try {
      await API.put(`/projects/${id}/tasks/${taskId}`, { status })
      fetchTasks()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await API.delete(`/projects/${id}/tasks/${taskId}`)
      fetchTasks()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteProject = async () => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return
    try {
      await API.delete(`/projects/${id}`)
      navigate('/projects')
    } catch (err) {
      console.error(err)
    }
  }

  const filteredTasks = tasks.filter((t) => {
    const statusMatch = statusFilter === 'all' || t.status === statusFilter
    const priorityMatch = priorityFilter === 'all' || t.priority === priorityFilter
    return statusMatch && priorityMatch
  })

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === 'done').length
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length
  const memberCount = project?.members?.length ?? 0

  if (loading) return <Layout><p className="text-gray-400 text-sm">Loading...</p></Layout>

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-white text-2xl font-bold">{project?.name}</h1>
          <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
            {project?.status}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isOwner && (
            <button
              onClick={handleDeleteProject}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm transition"
            >
              Delete Project
            </button>
          )}
          <button
            onClick={() => setShowTaskModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + New Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Tasks', value: totalTasks, color: 'text-white' },
          { label: 'Completed', value: completedTasks, color: 'text-green-400' },
          { label: 'In Progress', value: inProgressTasks, color: 'text-yellow-400' },
          { label: 'Team Members', value: memberCount, color: 'text-blue-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-900 border border-gray-800 text-gray-400 text-sm px-3 py-2 rounded-lg focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-gray-900 border border-gray-800 text-gray-400 text-sm px-3 py-2 rounded-lg focus:outline-none"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {isOwner && (
          <button
            onClick={() => setShowMemberModal(true)}
            className="ml-auto text-sm text-blue-400 hover:underline"
          >
            + Add Member
          </button>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 text-xs font-medium px-5 py-3">TITLE</th>
              <th className="text-left text-gray-400 text-xs font-medium px-5 py-3">PRIORITY</th>
              <th className="text-left text-gray-400 text-xs font-medium px-5 py-3">STATUS</th>
              <th className="text-left text-gray-400 text-xs font-medium px-5 py-3">ASSIGNEE</th>
              <th className="text-left text-gray-400 text-xs font-medium px-5 py-3">DUE DATE</th>
              <th className="text-left text-gray-400 text-xs font-medium px-5 py-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 text-sm py-8">
                  No tasks found
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-800/50 transition">
                  <td className="px-5 py-3">
                    <p className="text-white text-sm">{task.title}</p>
                    {task.description && (
                      <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{task.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}>
                      {task.priority?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full border-0 focus:outline-none cursor-pointer ${statusColors[task.status]}`}
                    style={{ background: 'transparent' }}
                    >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {task.assignee ? (
                        <>
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                            {task.assignee.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-gray-400 text-xs">{task.assignee.name}</span>
                        </>
                      ) : (
                        <span className="text-gray-500 text-xs">Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-gray-400 text-xs">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-400 hover:text-red-300 text-xs transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white font-semibold mb-4">Create Task</h2>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Title</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                  placeholder="Task title"
                  required
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 text-sm resize-none"
                  placeholder="Task description..."
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Assign To</label>
                <select
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value="">Unassigned</option>
                  {project?.members?.map((member) => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowTaskModal(false); setError('') }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-white font-semibold mb-4">Add Member</h2>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">User ID</label>
                <input
                  type="text"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                  placeholder="Paste user ID"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowMemberModal(false); setError('') }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}