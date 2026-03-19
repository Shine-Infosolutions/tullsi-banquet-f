import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AiFillFileExcel } from "react-icons/ai";
import { FiSearch, FiX, FiPlus, FiEdit, FiEye, FiFileText, FiTrash2, FiWifi, FiWifiOff, FiMenu } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import ChefPDFPreview from "../ChefPDFPreview";
import { bookingAPI } from '../../services/api';

const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

const ListBooking = ({ setSidebarOpen }) => {
  const tableRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [productToDelete, setProductToDelete] = useState(null);
  const [allData, setAllData] = useState([]);
  
  // Mock WebSocket for now
  const readyState = 0;
  const sendMessage = () => {};
  
  // Detect mobile view
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 600 : false
  );
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // Get user role from localStorage
  const userRole = localStorage.getItem("role") || "Staff";

  const fetchUsers = () => {
    setLoading(true);
    bookingAPI.getPaginated(currentPage)
      .then((res) => {
        if (res.data) {
          const processedData = res.data.data.map((item) => {
            const totalAdvance = Array.isArray(item.advance)
              ? item.advance.reduce((sum, payment) => sum + (payment.amount || 0), 0)
              : (typeof item.advance === 'number' ? item.advance : 0);
            return { ...item, advance: totalAdvance, total: item.total ?? 0, balance: item.balance ?? 0 };
          }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
          setUserData(processedData);
          setTotalPages(res.data.total);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Fetch Users Error:', err);
        alert('Failed to load bookings. Please try again later.');
        setLoading(false);
      });
  };

  const fetchAllData = () => {
    bookingAPI.getAll()
      .then((res) => {
        if (res.data) setAllData(res.data);
      })
      .catch((err) => {
        console.error('All Data Error:', err);
      });
  };

  useEffect(() => {
    fetchAllData();
    fetchUsers();
  }, [currentPage]);





  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  //   DELETE
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await bookingAPI.delete(id);
      alert('Booking deleted successfully');
      fetchUsers();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || 'Failed to delete booking');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModal = (product) => {
    console.log(product);
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete == "delete-all") {
      handleDelete("delete-all");
    }
    handleDelete(productToDelete._id);
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = async () => {
    if (searchQuery.trim() !== '') {
      setLoading(true);
      try {
        const response = await bookingAPI.search(encodeURIComponent(searchQuery));
        let dataArray = [];
        if (response.data) {
          if (Array.isArray(response.data)) dataArray = response.data;
          else if (response.data.success && Array.isArray(response.data.data)) dataArray = response.data.data;
          else if (response.data.data && Array.isArray(response.data.data)) dataArray = response.data.data;
        }
        setUserData(dataArray);
        setTotalPages(dataArray.length);
      } catch (error) {
        console.error('Search Error:', error);
        setUserData([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    } else {
      fetchUsers();
    }
  };

  const debouncedSearch = debounce(handleSearch, 300);
  const handleChange = (e) => {
    const { value } = e.target;
    setSearchQuery(value);
    clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => debouncedSearch(), 800);
  };

  // CSV export headers and data transformation
  const csvHeaders = [
    { label: "Name", key: "name" },
    { label: "Number", key: "number" },
    { label: "Email", key: "email" },
    { label: "WhatsApp Number", key: "whatsapp" },
    { label: "Paxs", key: "pax" },
    { label: "Booking Date", key: "startDate" },
    { label: "Food Type", key: "foodType" },
    { label: "Rate Plan", key: "ratePlan" },
    { label: "Advance", key: "advance" },
    { label: "GST", key: "gst" },
    { label: "Total Amount", key: "total" },
    { label: "Balance", key: "balance" },
    { label: "Rate Per Pax", key: "ratePerPax" },
    { label: "Hall", key: "hall" },
    { label: "Time", key: "time" },
    { label: "Discount", key: "discount" },
    { label: "Customer Reference", key: "customerRef" },
    { label: "Status", key: "bookingStatus" },
  ];

  const csvData = allData.map((item) => {
    const getStringValue = (value) => {
      if (typeof value === 'object' && value !== null) {
        return value.amount || value.value || JSON.stringify(value) || "";
      }
      return value || "";
    };
    
    return {
      name: getStringValue(item.name),
      number: getStringValue(item.number),
      whatsapp: getStringValue(item.whatsapp),
      pax: getStringValue(item.pax),
      startDate: item.startDate
        ? new Date(item.startDate).toLocaleDateString('en-GB')
        : "",
      foodType: getStringValue(item.foodType),
      ratePlan: getStringValue(item.ratePlan),
      advance: getStringValue(item.advance),
      gst: getStringValue(item.gst),
      total: getStringValue(item.total),
      balance: getStringValue(item.balance),
      ratePerPax: getStringValue(item.ratePerPax),
      hall: getStringValue(item.hall),
      time: getStringValue(item.time),
      discount: getStringValue(item.discount),
      customerRef: getStringValue(item.customerRef),
      bookingStatus: getStringValue(item.bookingStatus),
    };
  });

  // handle toggle

  const handleToggleStatus = async (id, currentStatus) => {
    const updatedStatus = !currentStatus;

    // Optimistic UI update
    setUserData((prevData) =>
      prevData.map((user) =>
        user._id === id ? { ...user, status: updatedStatus } : user
      )
    );

    try {
      const response = await axios.put(
        `https://shine-banquet-hotel-backend.vercel.app/little/achiver/update-status/${id}`,
        { status: updatedStatus }
      );
      
      if (response.data) {
        console.log("Status updated successfully:", response.data);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      // Revert the status change if the update failed
      setUserData((prevData) =>
        prevData.map((user) =>
          user._id === id ? { ...user, status: currentStatus } : user
        )
      );
    }
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Adjust this value to change the number of visible pages
    const maxPage = Math.ceil(totalPages / 10);

    for (let i = 1; i <= maxPage; i++) {
      pageNumbers.push(i);
    }

    let startPage;
    let endPage;

    if (maxPage <= maxPagesToShow) {
      startPage = 1;
      endPage = maxPage;
    } else {
      if (currentPage <= maxPagesToShow - 2) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + 1 >= maxPage) {
        startPage = maxPage - maxPagesToShow + 1;
        endPage = maxPage;
      } else {
        startPage = currentPage - 2; // Adjust the number of pages to show before and after the current page
        endPage = currentPage + 2; // Adjust the number of pages to show before and after the current page
      }
    }

    const visiblePages = pageNumbers.slice(startPage - 1, endPage);
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === maxPage;

    return (
      <nav className="mt-12 flex justify-center">
        <ul className="join ">
          <li className="page-item">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className={`px-4 py-2 cursor-pointer rounded-md  mx-1 ${
                isFirstPage ? "disabled" : ""
              }`}
              disabled={isFirstPage}
            >
              Previous
            </button>
          </li>
          {visiblePages?.map((number) => (
            <li key={number} className="page-item">
              <button
                onClick={() => handlePageChange(number)}
                className={`${
                  currentPage === number ? "bg-gray-400 text-white" : ""
                } px-4 py-2 mx-1 rounded-md`}
              >
                {number}
              </button>
            </li>
          ))}
          <li className="page-item">
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className={`px-4 py-2 cursor-pointer mx-1 bg-black rounded-md text-white ${
                isLastPage ? "disabled" : ""
              }`}
              disabled={isLastPage}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  // Function to handle CSV download
  const handleDownloadCSV = () => {
    if (!allData || allData.length === 0) {
      alert('No data available to export');
      return;
    }

    // Create CSV content
    const headers = csvHeaders.map(header => header.label).join(',');
    const rows = csvData.map(row => 
      csvHeaders.map(header => {
        const value = row[header.key] || '';
        // Escape commas and quotes in CSV
        return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Booking-List-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#c3ad6b] mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Booking List</h2>
          <p className="text-gray-500">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{backgroundColor: 'hsl(45, 100%, 95%)'}}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 w-full">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 xs:gap-4">
            {/* Hamburger Menu for Mobile */}
            <button
              onClick={() => setSidebarOpen && setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-[#c3ad6b] text-white hover:bg-[#b39b5a] active:bg-[#a08a4f] transition-colors touch-manipulation"
            >
              <FiMenu className="w-4 h-4 xs:w-5 xs:h-5" />
            </button>
            <h1 className="text-lg xs:text-xl lg:text-2xl font-bold truncate" style={{color: 'hsl(45, 100%, 20%)'}}>
              Booking List
            </h1>
          </div>
          <span className="inline-flex items-center gap-1 xs:gap-2 px-2 xs:px-3 py-1 rounded-full bg-[#c3ad6b]/10 text-[#c3ad6b] font-semibold text-xs xs:text-sm shadow">
            {userRole === "Admin" ? "👑 Admin" : "👤 Staff"}
          </span>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
          <div className="p-3 xs:p-4 sm:p-6 space-y-4 xs:space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
              <div className="flex items-center space-x-2 xs:space-x-3">
                <div className="bg-[#c3ad6b]/20 p-1.5 xs:p-2 rounded-full">
                  <FiPlus className="text-[#c3ad6b] text-base xs:text-lg" />
                </div>
                <h2 className="text-lg xs:text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>
                  Manage Bookings
                </h2>
              </div>
              
              <div className="flex gap-3">
                <Link
                  to={"/add-booking"}
                  className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow transition-colors font-semibold text-sm touch-manipulation"
                  style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
                >
                  <FiPlus className="text-sm" />
                  Add Booking
                </Link>
                <button
                  onClick={handleDownloadCSV}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-800 active:bg-gray-900 transition-colors font-semibold text-sm touch-manipulation"
                >
                  <AiFillFileExcel className="text-sm" />
                  Download CSV
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="form-control relative flex items-center max-w-full xs:max-w-md mx-auto">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base xs:text-lg" />
              <input
                className="input input-bordered pl-10 pr-10 py-2.5 xs:py-2 rounded-full w-full shadow-sm focus:ring-2 focus:ring-[#c3ad6b] text-sm xs:text-base"
                type="text"
                value={searchQuery}
                onChange={handleChange}
                placeholder={isMobile ? "Search..." : "Search By Name, Phone"}
              />
              {searchQuery && (
                <span
                  onClick={() => {
                    setSearchQuery("");
                    fetchUsers();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-red-500 hover:text-red-700 active:text-red-800 text-base xs:text-lg touch-manipulation"
                >
                  <FiX />
                </span>
              )}
            </div>

            {/* Table */}
            <div className="bg-gold/10 rounded-xl xs:rounded-2xl overflow-x-auto p-2 xs:p-3 sm:p-4">
              {loading ? (
                <div className="flex items-center justify-center m-auto py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#c3ad6b]"></div>
                </div>
              ) : userData && userData.length > 0 ? (
                <>
                  {/* Card view for mobile */}
                  <div className="block sm:hidden">
                    <div className="grid grid-cols-1 gap-3 xs:gap-4">
                      {userData?.map((item) => (
                        <div
                          key={item._id}
                          className="bg-white rounded-lg xs:rounded-xl shadow p-3 xs:p-4 flex flex-col border border-gray-100"
                        >
                          <div className="flex items-center gap-2 xs:gap-3 mb-2">
                            <div className="w-8 h-8 xs:w-10 xs:h-10 bg-[#c3ad6b]/20 rounded-full flex items-center justify-center text-[#c3ad6b] font-bold text-sm xs:text-lg">
                              {item.name?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-base xs:text-lg truncate">{item.name}</div>
                              <div className="text-gray-500 text-xs xs:text-sm break-all">
                                {item.phone || item.number}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 text-xs xs:text-sm mb-3">
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-600">Event Date:</span>
                              <span className="text-right">{new Date(item.eventDate || item.startDate).toLocaleDateString('en-GB')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-600">Rate Plan:</span>
                              <span className="text-right truncate ml-2">{item.ratePlan}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-600">Type:</span>
                              <span className="text-right">{item.foodType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-600">Advance:</span>
                              <span className="text-right">₹{item?.advance !== null && item?.advance !== undefined ? item?.advance : 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-600">Total:</span>
                              <span className="text-right font-semibold">₹{item.total || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-600">Status:</span>
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                                item.bookingStatus === 'Confirmed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : item.bookingStatus === 'Tentative'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {item.bookingStatus}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <Link
                              to={`/banquet/update-booking/${item._id}`}
                              className="flex-1 min-w-[60px] inline-flex items-center justify-center gap-1 bg-[#c3ad6b] hover:bg-[#b39b5a] text-white px-2 py-1 rounded text-xs font-semibold transition-colors"
                              title="Edit Booking"
                            >
                              <FiEdit className="text-xs" /> Edit
                            </Link>
                            <Link
                              to={`/banquet/menu-view/${item._id}`}
                              className="flex-1 min-w-[60px] inline-flex items-center justify-center gap-1 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors font-semibold px-2 py-1 text-xs"
                              title="View Menu"
                            >
                              <FiEye className="text-xs" /> Menu
                            </Link>
                            <Link
                              to={`/banquet/invoice/${item._id}`}
                              className="flex-1 min-w-[70px] inline-flex items-center justify-center gap-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold px-2 py-1 text-xs"
                              title="Generate Invoice"
                            >
                              <FiFileText className="text-xs" /> Invoice
                            </Link>
                            <ChefPDFPreview 
                              booking={item} 
                              className="flex-1 min-w-[70px] text-xs"
                            />
                            <button
                              onClick={() => {
                                let raw = String(item.whatsapp || item.number || "").replace(/[^\d]/g, "");
                                raw = raw.replace(/^0+/, "");
                                let phoneNumber = "";
                                if (raw.length === 10) {
                                  phoneNumber = `91${raw}`;
                                } else if (raw.length === 12 && raw.startsWith("91")) {
                                  phoneNumber = raw;
                                } else {
                                  alert("Invalid phone number for WhatsApp. Must be 10 digits (India) or 12 digits with country code.");
                                  return;
                                }
                                const message = `🌟 *Welcome to Hotel SHINE* 🌟\n\nHere's your booking confirmation:\n\n📅 *Date:* ${new Date(item.startDate).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}\n⏰ *Time:* ${item.time || "To be confirmed"}\n👨👩👧👦 *Guest Name:* ${item.name}\n📞 *Contact:* ${item.number}\n🍽️ *Plan:* ${item.ratePlan}\n🥗 *Food Type:* ${item.foodType}\n🏛️ *Hall/Area:* ${item.hall}\n👥 *Pax:* ${item.pax || "To be confirmed"}\n🔄 *Status:* ${item.bookingStatus}\n\n💰 *Payment Details:*\n💵 *Total Amount:* ₹${item.total || "To be confirmed"}\n💳 *Advance Paid:* ₹${item.advance}\n💸 *Balance Due:* ₹${item.balance || (item.total - item.advance) || "To be confirmed"}\n\n📍 *Venue Address:* Medical Road, Gorakhpur\n\nThank you for choosing us! We look forward to serving you. 🙏\n\n`;
                                const whatsappUrl = `https://web.whatsapp.com/send/?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
                                window.open(whatsappUrl, "_blank");
                              }}
                              className="flex-1 min-w-[80px] inline-flex items-center justify-center gap-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-semibold px-2 py-1 text-xs"
                              title="Send WhatsApp Message"
                            >
                              <FaWhatsapp className="text-xs" /> WhatsApp
                            </button>
                            <button
                              onClick={() => handleDeleteModal(item)}
                              className="flex-1 min-w-[60px] inline-flex items-center justify-center gap-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-semibold px-2 py-1 text-xs"
                              title="Delete Booking"
                            >
                              <FiTrash2 className="text-xs" /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Table view for desktop/tablet */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table
                      ref={tableRef}
                      className="w-full table-fixed text-sm text-left border-separate border-spacing-y-2 min-w-[1200px]"
                    >
                      <thead className="bg-[#c3ad6b] text-black font-semibold sticky top-0 z-10">
                        <tr>
                          <th className="py-3 px-4 rounded-tl-xl w-48">Name</th>
                          <th className="py-3 px-4 w-32">Number</th>
                          <th className="py-3 px-4 w-32">Booking Date</th>
                          <th className="py-3 px-4 w-24">Rate Plan</th>
                          <th className="py-3 px-4 w-20">Type</th>
                          <th className="py-3 px-4 w-24">Advance</th>
                          <th className="py-3 px-4 w-28">Total Amount</th>
                          <th className="py-3 px-4 w-32">Hall</th>
                          <th className="py-3 px-4 w-24">Status</th>
                          <th className="py-3 px-4 rounded-tr-xl w-80">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        {userData?.map((item, idx) => (
                          <tr
                            key={item._id}
                            className={
                              idx % 2 === 0
                                ? "bg-gray-50 hover:bg-[#c3ad6b]/20 transition-colors"
                                : "bg-white hover:bg-[#c3ad6b]/20 transition-colors"
                            }
                          >
                            <td className="px-4 py-4 font-bold">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#c3ad6b]/20 rounded-full flex items-center justify-center text-[#c3ad6b] font-bold text-sm flex-shrink-0">
                                  {item.name?.[0]?.toUpperCase() || "?"}
                                </div>
                                <span className="truncate">{item.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="truncate">{item.phone || item.number}</span>
                            </td>
                            <td className="px-4 py-4">
                              {new Date(item.eventDate || item.startDate).toLocaleDateString('en-GB')}
                            </td>
                            <td className="px-4 py-4">
                              <span className="truncate">{item.ratePlan}</span>
                            </td>
                            <td className="px-4 py-4">
                              {item.foodType}
                            </td>
                            <td className="px-4 py-4">
                              ₹{item.advance || 0}
                            </td>
                            <td className="px-4 py-4">
                              ₹{item.total || 0}
                            </td>
                            <td className="px-4 py-4">
                              <span className="truncate">{item.hall}</span>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                                item.bookingStatus === 'Confirmed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : item.bookingStatus === 'Tentative'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {item.bookingStatus}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-1 justify-start">
                                <Link
                                  to={`/banquet/update-booking/${item._id}`}
                                  className="inline-flex items-center gap-1 bg-[#c3ad6b] hover:bg-[#b39b5a] text-white px-2 py-1 rounded text-xs font-semibold transition-colors"
                                  title="Edit Booking"
                                >
                                  <FiEdit className="text-xs" /> Edit
                                </Link>
                                <Link
                                  to={`/banquet/menu-view/${item._id}`}
                                  className="inline-flex items-center gap-1 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors font-semibold px-2 py-1 text-xs"
                                  title="View Menu"
                                >
                                  <FiEye className="text-xs" /> Menu
                                </Link>
                                <Link
                                  to={`/banquet/invoice/${item._id}`}
                                  className="inline-flex items-center gap-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold px-2 py-1 text-xs"
                                  title="Invoice"
                                >
                                  <FiFileText className="text-xs" /> Invoice
                                </Link>
                                <ChefPDFPreview 
                                  booking={item} 
                                  className="text-xs"
                                />
                                <button
                                  onClick={() => {
                                    let raw = String(item.whatsapp || item.number || "").replace(/[^\d]/g, "");
                                    raw = raw.replace(/^0+/, "");
                                    let phoneNumber = "";
                                    if (raw.length === 10) {
                                      phoneNumber = `91${raw}`;
                                    } else if (raw.length === 12 && raw.startsWith("91")) {
                                      phoneNumber = raw;
                                    } else {
                                      alert("Invalid phone number for WhatsApp. Must be 10 digits (India) or 12 digits with country code.");
                                      return;
                                    }
                                    const message = `🌟 *Welcome to Hotel SHINE!* 🌟\n\nHere's your booking confirmation:\n\n📅 *Date:* ${new Date(item.startDate).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}\n⏰ *Time:* ${item.time || "To be confirmed"}\n👨👩👧👦 *Guest Name:* ${item.name}\n📞 *Contact:* ${item.number}\n🍽️ *Plan:* ${item.ratePlan}\n🥗 *Food Type:* ${item.foodType}\n🏛️ *Hall/Area:* ${item.hall}\n👥 *Pax:* ${item.pax || "To be confirmed"}\n🔄 *Status:* ${item.bookingStatus}\n\n💰 *Payment Details:*\n💵 *Total Amount:* ₹${item.total || "To be confirmed"}\n💳 *Advance Paid:* ₹${item.advance}\n💸 *Balance Due:* ₹${item.balance || (item.total - item.advance) || "To be confirmed"}\n\n📍 *Venue Address:* Medical Road, Gorakhpur\n\nThank you for choosing us! We look forward to serving you. 🙏\n\n`;
                                    const whatsappUrl = `https://web.whatsapp.com/send/?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
                                    window.open(whatsappUrl, "_blank");
                                  }}
                                  className="inline-flex items-center gap-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-semibold px-2 py-1 text-xs"
                                  title="Send WhatsApp Message"
                                >
                                  <FaWhatsapp className="text-xs" />
                                </button>
                                <button
                                  onClick={() => handleDeleteModal(item)}
                                  className="inline-flex items-center gap-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-semibold px-2 py-1 text-xs"
                                  title="Delete Booking"
                                >
                                  <FiTrash2 className="text-xs" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center w-full m-auto">
                  <svg
                    width="48"
                    height="48"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="text-gray-300 mb-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 17v-2a4 4 0 014-4h3m4 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h6a3 3 0 013 3v1"
                    />
                  </svg>
                  <p className="font-semibold text-gray-400 text-lg">
                    No Booking Found!
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="mt-6">
              <nav className="flex justify-center">
                <ul className="flex items-center space-x-2">
                  <li>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={`px-4 py-2 rounded-md border transition-colors ${
                        currentPage === 1 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" 
                          : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                      }`}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  
                  {(() => {
                    const maxPage = Math.ceil(totalPages / 10);
                    const pages = [];
                    for (let i = 1; i <= Math.min(maxPage, 5); i++) {
                      pages.push(
                        <li key={i}>
                          <button
                            onClick={() => handlePageChange(i)}
                            className={`px-4 py-2 rounded-md border transition-colors ${
                              currentPage === i
                                ? "bg-[#c3ad6b] text-white border-[#c3ad6b]"
                                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                            }`}
                          >
                            {i}
                          </button>
                        </li>
                      );
                    }
                    return pages;
                  })()}
                  
                  <li>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={`px-4 py-2 rounded-md border transition-colors ${
                        currentPage === Math.ceil(totalPages / 10)
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                          : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                      }`}
                      disabled={currentPage === Math.ceil(totalPages / 10)}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Delete Modal */}
            {isDeleteModalOpen && productToDelete && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-3 xs:mx-0">
                  <div className="p-4 xs:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3 xs:mb-4">
                      Delete Booking
                    </h3>
                    <p className="text-gray-600 mb-4 xs:mb-6 text-sm xs:text-base">
                      Are you sure you want to delete this booking? This action cannot be undone.
                    </p>
                    <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 xs:justify-end">
                      <button
                        onClick={cancelDelete}
                        className="px-4 py-2.5 xs:py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 active:bg-gray-500 transition-colors touch-manipulation text-sm xs:text-base"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmDelete}
                        className="px-4 py-2.5 xs:py-2 bg-red-600 text-white rounded hover:bg-red-700 active:bg-red-800 transition-colors touch-manipulation text-sm xs:text-base"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ListBooking;