import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaCalendarAlt, FaList, FaUtensils, FaCalendarCheck, FaSignOutAlt } from 'react-icons/fa'
import Logo from "../assets/tulsiwhite.png"


const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const handleLogout = () => {
    localStorage.removeItem('User')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('role')
    window.location.href = '/'
  }

  const menuItems = [
    {
      title: 'Calendar',
      icon: FaCalendarAlt,
      path: '/calendar'
    },
    {
      title: 'Booking List',
      icon: FaList,
      path: '/banquet/list-booking'
    },
    {
      title: 'Menu Plan',
      icon: FaUtensils,
      path: '/menu-plan'
    },
    {
      title: 'Lagan Calendar',
      icon: FaCalendarCheck,
      path: '/lagan-calendar'
    }
  ]

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 w-64 lg:w-64 xl:w-72 2xl:w-80 bg-gray-800 text-white min-h-screen z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-600">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32">
            <img src={Logo} alt="Tulsi Logo" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>

      {/* Admin Section */}
      <div className="px-6 py-4 border-b border-gray-700">
        <h2 className="text-[#c3ad6b] font-semibold text-lg">ADMIN PANEL</h2>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 flex flex-col">
        <ul className="space-y-3 flex-1">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-[#c3ad6b] text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-md'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 flex-shrink-0 ${
                  location.pathname === item.path ? 'text-white' : 'text-[#c3ad6b]'
                }`} />
                <span className="font-medium text-base">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
        
        {/* Logout Button */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200 hover:shadow-md"
          >
            <FaSignOutAlt className="w-5 h-5 mr-3 text-red-400 flex-shrink-0" />
            <span className="font-medium text-base">Logout</span>
          </button>
        </div>
      </nav>
      </div>
    </>
  )
}

export default Sidebar