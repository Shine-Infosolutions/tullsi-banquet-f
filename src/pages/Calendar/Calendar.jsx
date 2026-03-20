import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaUser, FaPhone, FaStickyNote, FaRegCalendarAlt, FaBars, FaSearch, FaFilter } from 'react-icons/fa'
import { bookingAPI } from '../../services/api'
import DashboardLoader from '../../DashboardLoader'
import { motion, AnimatePresence } from 'framer-motion'

function Calendar({ setSidebarOpen }) {
  const [pageLoading, setPageLoading] = useState(true)
  const [bookings, setBookings] = useState({})
  const [allBookings, setAllBookings] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [hoveredDate, setHoveredDate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showFilters, setShowFilters] = useState(false)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 600 : false
  )
  const calendarRef = useRef(null)
  const navigate = useNavigate()
  
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())
  const userRole = localStorage.getItem("role") || "Staff"

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setHoveredDate(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [month, year, searchTerm, statusFilter])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await bookingAPI.getAll()
      const data = res.data
      
      let bookingsArray = []
      if (Array.isArray(data)) {
        bookingsArray = data
      } else if (data?.data && Array.isArray(data.data)) {
        bookingsArray = data.data
      }
      
      setAllBookings(bookingsArray)
      
      // Apply filters
      const filteredBookings = bookingsArray.filter(booking => {
        const matchesSearch = !searchTerm || 
          (booking.name && booking.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (booking.phone && booking.phone.includes(searchTerm)) ||
          (booking.number && booking.number.includes(searchTerm)) ||
          (booking.contact && booking.contact.includes(searchTerm))
        
        const matchesStatus = statusFilter === 'All' || 
          (booking.bookingStatus && booking.bookingStatus === statusFilter)
        
        return matchesSearch && matchesStatus
      })
      
      const grouped = {}
      filteredBookings.forEach((booking) => {
        const dateKey = (booking.eventDate || booking.startDate)?.split('T')[0]
        if (dateKey) {
          if (!grouped[dateKey]) grouped[dateKey] = []
          grouped[dateKey].push(booking)
        }
      })
      
      setBookings(grouped)
      console.log('Calendar bookings:', filteredBookings)
    } catch (err) {
      console.error('Failed to fetch bookings for calendar:', err)
    } finally {
      setLoading(false)
    }
  }

  const format = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const getAuspiciousDates = (year) => {
    const format = (m, d) =>
      `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    return [
      format(1, 16), format(1, 17), format(1, 18), format(1, 19), format(1, 21),
      format(1, 22), format(1, 24), format(1, 25), format(1, 30), format(2, 3),
      format(2, 4), format(2, 6), format(2, 7), format(2, 13), format(2, 14),
      format(2, 15), format(2, 18), format(2, 19), format(2, 20), format(2, 21),
      format(2, 25), format(3, 1), format(3, 2), format(3, 3), format(3, 5),
      format(3, 6), format(4, 14), format(4, 16), format(4, 17), format(4, 18),
      format(4, 19), format(4, 20), format(4, 21), format(4, 22), format(4, 23),
      format(4, 25), format(4, 29), format(4, 30), format(5, 1), format(5, 5),
      format(5, 6), format(5, 7), format(5, 8), format(5, 10), format(5, 15),
      format(5, 17), format(5, 18), format(5, 19), format(5, 24), format(5, 28),
      format(6, 2), format(6, 4), format(6, 7), format(6, 8), format(7, 11),
      format(7, 12), format(7, 13), format(7, 17), format(7, 20), format(7, 21),
      format(7, 22), format(7, 26), format(7, 28), format(7, 29), format(7, 31),
      format(8, 1), format(8, 3), format(8, 4), format(8, 7), format(8, 8),
      format(8, 9), format(8, 13), format(8, 14), format(8, 17), format(8, 24),
      format(8, 25), format(8, 28), format(8, 29), format(8, 30), format(8, 31),
      format(9, 1), format(9, 2), format(9, 3), format(9, 4), format(9, 5),
      format(9, 26), format(9, 27), format(9, 28), format(10, 1), format(10, 2),
      format(10, 3), format(10, 4), format(10, 7), format(10, 8), format(10, 10),
      format(10, 11), format(10, 12), format(10, 22), format(10, 23), format(10, 24),
      format(10, 25), format(10, 26), format(10, 27), format(10, 28), format(10, 29),
      format(10, 30), format(10, 31), format(11, 2), format(11, 3), format(11, 4),
      format(11, 7), format(11, 8), format(11, 12), format(11, 13), format(11, 22),
      format(11, 23), format(11, 24), format(11, 25), format(11, 26), format(11, 27),
      format(11, 29), format(11, 30), format(12, 4), format(12, 5), format(12, 6)
    ]
  }

  const auspiciousDates = new Set(getAuspiciousDates(year))

  const getDateCategory = (date) => {
    const heavyDates = new Set(
      Array.from(auspiciousDates).filter((d) =>
        [1, 5, 10, 15, 20, 25, 30].includes(parseInt(d.split("-")[2]))
      )
    )
    const mediumDates = new Set(
      Array.from(auspiciousDates).filter((d) =>
        [2, 4, 7, 9, 17, 22, 27].includes(parseInt(d.split("-")[2]))
      )
    )
    if (heavyDates.has(date)) return "heavy"
    if (mediumDates.has(date)) return "medium"
    if (auspiciousDates.has(date)) return "light"
    return null
  }

  const getTooltipText = (category) => {
    if (category === "heavy") return "Heavy Booking"
    if (category === "medium") return "Medium Booking"
    if (category === "light") return "Light Booking"
    return ""
  }

  const dateTemplate = ({ year, month, day }) => {
    const currentDate = format(year, month, day)
    const dayBookings = bookings[currentDate] || []
    const bookingCount = dayBookings.length
    
    // Determine fill position based on booking count and time
    let fillPosition = 'none'
    
    if (bookingCount >= 2) {
      // 2 या अधिक bookings = पूरा colored
      fillPosition = 'full'
    } else if (bookingCount === 1) {
      const booking = dayBookings[0]
      const timeValue = booking.eventTime || booking.startTime || booking.timeSlot || booking.time || booking.slot
      
      if (timeValue) {
        // Time को parse करें
        let hour = 0
        if (timeValue.includes(':')) {
          hour = parseInt(timeValue.split(':')[0])
        } else if (timeValue.toLowerCase().includes('pm') && !timeValue.toLowerCase().includes('12')) {
          hour = parseInt(timeValue) + 12
        } else {
          hour = parseInt(timeValue)
        }
        
        // 4 PM (16:00) से पहले = first half (upper), बाद में = second half (lower)
        fillPosition = hour < 16 ? 'upper' : 'lower'
      } else {
        // अगर time नहीं मिला तो default upper
        fillPosition = 'upper'
      }
    }
    
    const isSelected = selectedDate === currentDate
    
    return (
      <div
        className={`w-12 h-12 sm:w-16 sm:h-16 relative rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden ${
          isSelected 
            ? 'bg-[#c3ad6b] text-white shadow-lg scale-105 border-2 border-[#c3ad6b]' 
            : 'bg-white hover:bg-[#c3ad6b]/10 border border-gray-200 hover:border-[#c3ad6b]/30'
        }`}
        onClick={() => setSelectedDate(currentDate)}
        onMouseEnter={() => setHoveredDate(currentDate)}
        onMouseLeave={() => setHoveredDate(null)}
        title={bookingCount > 0 ? `${bookingCount} booking${bookingCount > 1 ? 's' : ''} - ${fillPosition === 'upper' ? 'First Half' : fillPosition === 'lower' ? 'Second Half' : fillPosition === 'full' ? 'Full Day' : ''}` : ''}
      >
        {/* Fill based on booking time - only show when not selected */}
        {!isSelected && (
          <>
            {fillPosition === 'upper' && (
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-[#c3ad6b] opacity-70 rounded-t-lg"></div>
            )}
            {fillPosition === 'lower' && (
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#c3ad6b] opacity-70 rounded-b-lg"></div>
            )}
            {fillPosition === 'full' && (
              <div className="absolute inset-0 bg-[#c3ad6b] opacity-70 rounded-lg"></div>
            )}
          </>
        )}
        
        {/* Day number */}
        <span className={`font-bold text-xs sm:text-sm z-10 ${
          isSelected ? 'text-white' : 'text-gray-800'
        }`}>
          {day}
        </span>
        
        {/* Booking count indicator */}
        {bookingCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow">
            {bookingCount}
          </div>
        )}
      </div>
    )
  }

  const renderCalendar = () => {
    const weeks = []
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    let day = 1
    
    for (let week = 0; week < 6; week++) {
      const days = []
      for (let i = 0; i < 7; i++) {
        const cellIndex = week * 7 + i
        if (cellIndex < firstDay || day > daysInMonth) {
          days.push(
            <td key={i} className="h-16 sm:h-20 align-top text-center"></td>
          )
        } else {
          const cellContent = dateTemplate({ year, month, day })
          days.push(
            <td key={i} className="h-16 sm:h-20 p-1">
              <div className="h-full flex items-center justify-center">
                {cellContent}
              </div>
            </td>
          )
          day++
        }
      }
      const isRowEmpty = days.every(
        (cell) =>
          !cell.props.children || cell.props.children.props === undefined
      )
      if (!isRowEmpty) {
        weeks.push(<tr key={week}>{days}</tr>)
      }
    }
    return weeks
  }

  const handlePrev = () => {
    if (month === 0) {
      setMonth(11)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const handleNext = () => {
    if (month === 11) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const bookingsForDate = bookings[selectedDate] || []

  // Convert 24-hour time to 12-hour format
  const convertTo12Hour = (time24) => {
    if (!time24) return time24
    
    // If already in 12-hour format, return as is
    if (time24.toLowerCase().includes('am') || time24.toLowerCase().includes('pm')) {
      return time24
    }
    
    // Handle HH:MM format
    if (time24.includes(':')) {
      const [hours, minutes] = time24.split(':')
      const hour = parseInt(hours)
      const min = minutes || '00'
      
      if (hour === 0) return `12:${min} AM`
      if (hour < 12) return `${hour}:${min} AM`
      if (hour === 12) return `12:${min} PM`
      return `${hour - 12}:${min} PM`
    }
    
    // Handle single number format
    const hour = parseInt(time24)
    if (isNaN(hour)) return time24
    
    if (hour === 0) return '12 AM'
    if (hour < 12) return `${hour} AM`
    if (hour === 12) return '12 PM'
    return `${hour - 12} PM`
  }

  if (pageLoading) {
    return <DashboardLoader pageName="Calendar" />
  }

  const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.09 } } }} className="min-h-screen" style={{backgroundColor: 'hsl(45, 100%, 95%)'}}>
      {/* Header */}
      <motion.header variants={fadeUp} className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Hamburger Menu for Mobile */}
            <button
              onClick={() => setSidebarOpen && setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-[#c3ad6b] text-white hover:bg-[#b39b5a] transition-colors"
            >
              <FaBars className="w-5 h-5" />
            </button>
            <h1 className="text-xl lg:text-2xl font-bold" style={{color: 'hsl(45, 100%, 20%)'}}>
              Event Calendar
            </h1>
          </div>
          {isMobile && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c3ad6b]/10 text-[#c3ad6b] font-semibold text-sm shadow">
              {userRole === "Admin" ? "👑 Admin" : "👤 Staff"}
            </span>
          )}
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <motion.div variants={fadeUp} className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-3 sm:p-6">
            {/* Search and Filter */}
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c3ad6b] text-sm sm:text-base"
                  />
                </div>
                
                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 sm:py-3 rounded-lg border transition-colors text-sm sm:text-base ${
                    showFilters 
                      ? 'bg-[#c3ad6b] text-white border-[#c3ad6b]' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <FaFilter className="inline mr-2" />
                  Filters
                </button>
              </div>
              
              {/* Filter Options */}
              {showFilters && (
                <div className="mt-3 p-3 sm:p-4 bg-gray-50 rounded-lg border">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c3ad6b] text-sm"
                      >
                        <option value="All">All Status</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Pending">Pending</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          setSearchTerm('')
                          setStatusFilter('All')
                        }}
                        className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="bg-gradient-to-r from-[#c3ad6b]/10 to-[#c3ad6b]/5 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-[#c3ad6b] hover:bg-[#b39b5a] text-white rounded-lg shadow-md font-semibold transition-all duration-200 text-sm sm:text-base whitespace-nowrap"
                >
                  <span>←</span>
                  <span className="hidden xs:inline">Previous</span>
                </button>
                <h2 className="text-base sm:text-xl md:text-2xl font-bold text-center flex-1 min-w-0 truncate" style={{color: 'hsl(45, 100%, 20%)'}}>
                  {monthNames[month]} {year}
                </h2>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-[#c3ad6b] hover:bg-[#b39b5a] text-white rounded-lg shadow-md font-semibold transition-all duration-200 text-sm sm:text-base whitespace-nowrap"
                >
                  <span className="hidden xs:inline">Next</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Calendar */}
            <div className="overflow-x-auto bg-[#c3ad6b]/10 rounded-xl p-2 sm:p-4">
              <table className="w-full border-collapse min-w-[280px] sm:min-w-[600px]">
                <thead>
                  <tr>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <th key={day} className="h-8 sm:h-12 text-xs sm:text-sm md:text-base font-bold text-[#c3ad6b] border-b-2 border-[#c3ad6b]/20">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>{renderCalendar()}</tbody>
              </table>
            </div>

            {/* Add Booking Button */}
            <div className="mt-4 sm:mt-6 text-center">
              <Link
                to="/add-booking"
                state={{ selectedDate }}
              >
                <button
                  className={`w-full sm:w-auto py-2 sm:py-3 px-6 sm:px-8 rounded-lg font-semibold shadow transition-colors text-sm sm:text-base ${
                    selectedDate
                      ? "bg-[#c3ad6b] hover:bg-[#b39b5a] text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!selectedDate}
                >
                  Add Booking {selectedDate && `for ${selectedDate}`}
                </button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Booking list for selected date */}
        <AnimatePresence>
        {selectedDate && (
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="mt-4 sm:mt-6"
          >
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-3 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{color: 'hsl(45, 100%, 20%)'}}>
                  Bookings for {selectedDate}
                </h3>
                {bookingsForDate.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-lg">
                      No bookings for this date
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bookingsForDate.map((b, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className="bg-[#c3ad6b]/10 border border-[#c3ad6b]/20 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="font-bold text-gray-800 mb-2">{b.name}</div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>📞 {b.phone || b.number || b.contact}</div>
                          <div>📋 {b.bookingStatus}</div>
                          {(b.startTime || b.time) && (
                            <div>⏰ {convertTo12Hour(b.startTime || b.time)}</div>
                          )}
                          {b.notes && (
                            <div>📝 {b.notes}</div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </main>
    </motion.div>
  )
}

export default Calendar