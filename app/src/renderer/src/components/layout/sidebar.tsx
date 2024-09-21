import { HomeIcon, PartyPopper, UserIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function SideBar() {
  const location = useLocation()
  const [activeItem, setActiveItem] = useState(location.pathname)

  useEffect(() => {
    setActiveItem(location.pathname)
  }, [location])

  const menuItems = [
    { icon: HomeIcon, label: 'Home', path: '/' },
    { icon: PartyPopper, label: 'Party', path: '/party' },
    { icon: UserIcon, label: 'Profile', path: '/profile' }
  ]

  return (
    <aside className="flex flex-col h-screen w-64 bg-gray-100 text-gray-800 p-4 shadow-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Sniper</h1>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = activeItem === item.path
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                      : 'hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : 'text-gray-500'}`}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      {/* <div className='mt-auto pt-4 border-t border-gray-200'>
        {isLoggedIn && <DynamicWidget />}
      </div> */}
    </aside>
  )
}
