import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '⊞' },
  { label: 'Projects', path: '/projects', icon: '◫' },
  { label: 'Team', path: '/team', icon: '◎' },
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="w-60 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
          <div>
            <p className="text-white text-sm font-semibold">TaskManager</p>
            <p className="text-gray-400 text-xs">1 workspace</p>
          </div>
        </div>
      </div>

      
      <nav className="p-3 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-1 transition ${
              pathname === item.path
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

     
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white text-xs font-medium">{user?.name}</p>
            <p className="text-gray-400 text-xs">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-gray-400 hover:text-red-400 text-xs transition"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}