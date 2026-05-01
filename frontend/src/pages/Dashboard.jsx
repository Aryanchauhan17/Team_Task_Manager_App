import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import API from '../api/axios'

const StatCard = ({ label, value, color }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
    <p className="text-gray-400 text-sm mb-1">{label}</p>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
)

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/dashboard')
        setData(res.data.dashboard)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return (
    <Layout>
      <div className="text-gray-400 text-sm">Loading...</div>
    </Layout>
  )

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Overview of your tasks and projects</p>
      </div>

      
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Projects" value={data?.totalProjects ?? 0} color="text-white" />
        <StatCard label="My Tasks" value={data?.myTasks?.total ?? 0} color="text-white" />
        <StatCard label="In Progress" value={data?.myTasks?.inProgress ?? 0} color="text-yellow-400" />
        <StatCard label="Completed" value={data?.myTasks?.completed ?? 0} color="text-green-400" />
      </div>

      
      {data?.overdueTasks?.total > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
          <p className="text-red-400 text-sm font-medium">
            ⚠ {data.overdueTasks.total} overdue task{data.overdueTasks.total > 1 ? 's' : ''}
          </p>
        </div>
      )}

      
      <div className="bg-gray-900 border border-gray-800 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-white text-sm font-semibold">Recent Tasks</h2>
        </div>
        <div className="divide-y divide-gray-800">
          {data?.recentTasks?.length === 0 && (
            <p className="text-gray-400 text-sm p-5">No tasks yet</p>
          )}
          {data?.recentTasks?.map((task) => (
            <div key={task.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-white text-sm">{task.title}</p>
                <p className="text-gray-400 text-xs mt-0.5">{task.project?.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                  task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-700 text-gray-400'
                }`}>
                  {task.priority}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                    task.status === 'done' ? 'bg-green-500/20 text-green-400' :
                    task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-700 text-gray-400'
                    }`}>
                    {task.status === 'in-progress' ? 'In Progress' :
                    task.status === 'done' ? 'Done' : 'To Do'}
                    </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}