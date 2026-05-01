import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import API from '../api/axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [error, setError] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  const fetchProjects = async () => {
    try {
      const res = await API.get('/projects')
      setProjects(res.data.projects)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await API.post('/projects', form)
      setForm({ name: '', description: '' })
      setShowModal(false)
      fetchProjects()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project')
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Projects</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your projects</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + New Project
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : projects.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
          <p className="text-gray-400 text-sm">No projects yet</p>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-blue-400 text-sm hover:underline"
            >
              Create your first project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 cursor-pointer hover:border-gray-600 transition"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-sm">{project.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  project.status === 'archived' ? 'bg-gray-700 text-gray-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {project.status}
                </span>
              </div>
              <p className="text-gray-400 text-xs mb-4 line-clamp-2">
                {project.description || 'No description'}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-xs">
                  {project.members?.length ?? 0} member{project.members?.length !== 1 ? 's' : ''}
                </p>
                <p className="text-gray-500 text-xs">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white font-semibold mb-4">Create Project</h2>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Project Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                  placeholder="My Project"
                  required
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 text-sm resize-none"
                  placeholder="Project description..."
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}