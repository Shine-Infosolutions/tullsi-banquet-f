import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Logo from "../../assets/tulsiwhite.png";

import { useNavigate } from "react-router-dom";

const MenuView = () => {
  const { id } = useParams();
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Try to fetch menu first
        try {
          const res = await axios.get(
            `https://shine-banquet-hotel-backend.vercel.app/api/menus/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          console.log('Menu API Response:', res.data);
          setMenu(res.data.data?.categories || res.data.data || res.data || {});
          return;
        } catch (menuError) {
          console.log('Menu not found, trying booking data...');
        }
        
        // Fallback: try to get menu from booking data
        const bookingRes = await axios.get(
          `https://shine-banquet-hotel-backend.vercel.app/api/bookings/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        const bookingData = bookingRes.data.data || bookingRes.data;
        if (bookingData.categorizedMenu) {
          setMenu(bookingData.categorizedMenu);
        } else {
          setError("No menu found for this booking. The menu may not have been created yet.");
        }
        
      } catch (error) {
        console.error('Fetch error:', error);
        setError("Failed to load menu. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchMenu();
  }, [id]);
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f7f5ef] to-[#c3ad6b]/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c3ad6b] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading menu...</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-100 to-[#c3ad6b]/30">
        <div className="bg-red-100 border-l-4 border-[#c3ad6b] text-[#c3ad6b] p-4 max-w-md rounded shadow">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  if (!menu)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 to-[#c3ad6b]/30">
        <div className="bg-yellow-100 border-l-4 border-[#c3ad6b] text-[#c3ad6b] p-4 max-w-md rounded shadow">
          <p className="font-bold">Not Found</p>
          <p>No menu found for this booking reference.</p>
        </div>
      </div>
    );
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-[#c3ad6b]/20 text-[#c3ad6b] rounded hover:bg-[#c3ad6b]/40 font-semibold shadow print:shadow-none print:bg-gray-200 print:text-black"
        >
          ← Back
        </button>

      </div>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <img
            src={Logo}
            alt="Hotel Logo"
            className="w-48 h-48 mx-auto mb-4 object-contain"
          />
        </div>
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <div className="px-4 py-5 sm:px-4 bg-gradient-to-r from-[#f7f5ef] to-[#c3ad6b]/30">
            <h3 className="text-lg leading-6 font-bold text-gray-900 text-center">
              <img src={Logo} alt="Tulsi Logo" className="w-16 h-16 mx-auto mb-2" />
              TULSI
            </h3>
          </div>
          <div className="h-3"></div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
              {Object.entries(menu).map(([category, items]) => {
                const skip = [
                  "_id",
                  "createdAt",
                  "updatedAt",
                  "__v",
                  "bookingRef",
                  "customerRef",
                ];
                if (skip.includes(category)) return null;
                if (Array.isArray(items) && items.length > 0) {
                  return (
                    <div
                      key={category}
                      className="bg-[#c3ad6b]/10 rounded-lg p-4 shadow-sm border border-[#c3ad6b]/30"
                    >
                      <h4 className="text-lg font-semibold text-[#c3ad6b] mb-3 pb-2 border-b border-[#c3ad6b]/30">
                        {category
                          .replaceAll("_", " ")
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </h4>
                      <ul className="space-y-2">
                        {items.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start"
                          >
                            <span className="flex-shrink-0 h-5 w-5 text-[#c3ad6b] mr-2">
                              •
                            </span>
                            <span className="text-gray-700">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MenuView;