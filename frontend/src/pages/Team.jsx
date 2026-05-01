import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import API from '../api/axios'

export default function Team() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await API.get('/projects')
        const detailed = await Promise.all(
          res.data.projects.map((p) => API.get(`/projects/${p.id}`))
        )
        setProjects(detailed.map((r) => r.data.project))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  // collect all unique members across all projects
  const allMembers = []
  const seenIds = new Set()

  projects.forEach((project) => {
    project.members?.forEach((member) => {
      if (!seenIds.has(member.id)) {
        seenIds.add(member.id)
        allMembers.push({ ...member, projects: [project.name] })
      } else {
        const existing = allMembers.find((m) => m.id === member.id)
        if (existing) existing.projects.push(project.name)
      }
    })
  })

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">Team</h1>
        <p className="text-gray-400 text-sm mt-1">All members across your projects</p>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : allMembers.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
          <p className="text-gray-400 text-sm">No team members yet</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-xs font-medium px-5 py-3">MEMBER</th>
                <th className="text-left text-gray-400 text-xs font-medium px-5 py-3">EMAIL</th>
                <th className="text-left text-gray-400 text-xs font-medium px-5 py-3">ROLE</th>
                <th className="text-left text-gray-400 text-xs font-medium px-5 py-3">PROJECTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {allMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-800/50 transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white text-sm">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-gray-400 text-sm">{member.email}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      member.role === 'admin'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {member.projects.map((p) => (
                        <span key={p} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}