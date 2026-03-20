import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useReactToPrint } from "react-to-print";
import Logo from "../assets/tulsiblack.png";


const ChefPDFPreview = ({ booking, className }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(false);
  const printRef = useRef();

  const fetchMenuData = async () => {
    setLoading(true);
    try {
      // First try to use booking's categorizedMenu if available
      if (booking.categorizedMenu && Object.keys(booking.categorizedMenu).length > 0) {
        console.log('Using booking categorizedMenu:', booking.categorizedMenu);
        setMenuData(booking.categorizedMenu);
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      
      // Try multiple API endpoints
      const endpoints = [
        `https://tulsi-banquet-backend.vercel.app/api/banquet-menus/${booking._id}`,
        `https://tulsi-banquet-backend.vercel.app/api/menus/all/${booking.customerRef || booking._id}`,
        `https://tulsi-banquet-backend.vercel.app/api/menus/${booking._id}`
      ];

      for (const endpoint of endpoints) {
        try {
          console.log('Trying endpoint:', endpoint);
          const response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('API Response:', response.data);
          
          let menuData = null;
          if (response.data?.menu?.categories) {
            menuData = response.data.menu.categories;
          } else if (response.data?.data?.categories) {
            menuData = response.data.data.categories;
          } else if (response.data?.categories) {
            menuData = response.data.categories;
          } else if (response.data?.data) {
            menuData = response.data.data;
          }
          
          if (menuData && Object.keys(menuData).length > 0) {
            console.log('Found menu data:', menuData);
            setMenuData(menuData);
            return;
          }
        } catch (err) {
          console.log('Endpoint failed:', endpoint, err.message);
          continue;
        }
      }
      
      // If no API worked, use booking data as fallback
      setMenuData(booking.categorizedMenu || {});
    } catch (error) {
      console.error('Error fetching menu:', error);
      setMenuData(booking.categorizedMenu || {});
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    await fetchMenuData();
    setShowPreview(true);
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Chef_Instructions_${booking.customerRef || booking.name}_${new Date().toISOString().split('T')[0]}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0.5in;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        * { print-color-adjust: exact !important; }
      }
    `,
    onAfterPrint: () => console.log('Print completed')
  });

  return (
    <>
      <button
        onClick={handlePreview}
        className={`inline-flex items-center justify-center gap-1 bg-[#c3ad6b] hover:bg-[#b39b5a] text-white rounded transition-colors font-semibold px-2 py-1 ${className || ''}`}
        title="Chef Instructions"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Chef
      </button>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl mx-auto max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Chef Instructions Preview</h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 text-white rounded transition-colors"
                  style={{backgroundColor: '#c3ad6b'}}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#b39b5a'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#c3ad6b'}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Download PDF'}
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{borderColor: '#c3ad6b'}}></div>
                  <span className="ml-2">Loading menu...</span>
                </div>
              ) : (
                <div ref={printRef} className="bg-white p-8 max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <img src={Logo} alt="Tulsi Logo" className="w-40 h-auto mx-auto mb-4" />
                    <h1 className="text-2xl font-bold">TULSI BANQUET - CHEF INSTRUCTIONS</h1>
                  </div>
                  
                  <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4 pb-2" style={{borderBottom: '2px solid #c3ad6b', color: '#c3ad6b'}}>BOOKING DETAILS</h2>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                      <div><strong>Customer:</strong> {booking.name || 'N/A'}</div>
                      <div><strong>Date:</strong> {new Date(booking.startDate).toLocaleDateString()}</div>
                      <div><strong>Time:</strong> {booking.time || 'N/A'}</div>
                      <div>
                        <strong>Pax:</strong>{' '}
                        {booking.foodType === 'Both'
                          ? `${booking.pax || 0} total (🥦 ${booking.vegPax || 0} Veg + 🍗 ${booking.nonVegPax || 0} Non-Veg)`
                          : booking.pax || 'N/A'}
                      </div>
                      <div><strong>Food Type:</strong> {booking.foodType || 'N/A'}</div>
                      <div><strong>Rate Plan:</strong> {booking.ratePlan || 'N/A'}</div>
                      <div><strong>Hall:</strong> {booking.hall || 'N/A'}</div>
                      <div><strong>Ref:</strong> {booking.customerRef || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-bold mb-6 pb-2" style={{borderBottom: '2px solid #c3ad6b', color: '#c3ad6b'}}>MENU ITEMS TO PREPARE</h2>
                    {(() => {
                      const displayMenuData = menuData || booking.categorizedMenu;
                      const skip = ["_id", "createdAt", "updatedAt", "__v", "bookingRef", "customerRef"];
                      const isNonVegCat = (cat) => /NON.?VEG/i.test(cat);

                      if (!displayMenuData || typeof displayMenuData !== 'object' || Object.keys(displayMenuData).length === 0) {
                        return booking.menuItems
                          ? <div className="text-sm"><p>{booking.menuItems}</p></div>
                          : <p className="text-center py-8 text-gray-500">No menu items available</p>;
                      }

                      const entries = Object.entries(displayMenuData).filter(
                        ([k, v]) => !skip.includes(k) && Array.isArray(v) && v.length > 0
                      );

                      const renderCategoryBlock = (category, items) => (
                        <div key={category} className="mb-5">
                          <h3 className="text-sm font-bold mb-2 uppercase pb-1" style={{borderBottom: '1px solid #e8dfc8', color: '#c3ad6b'}}>
                            {category.replaceAll('_', ' ')}
                          </h3>
                          <ul className="space-y-1">
                            {items.map((item, i) => (
                              <li key={i} className="flex items-start text-sm">
                                <span className="mr-2 mt-0.5 text-xs">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );

                      if (booking.foodType === 'Both') {
                        const vegEntries = entries.filter(([k]) => !isNonVegCat(k));
                        const nonVegEntries = entries.filter(([k]) => isNonVegCat(k));
                        return (
                          <div className="grid grid-cols-2 gap-6">
                            {/* Veg Column */}
                            <div style={{border: '1px solid #bbf7d0', borderRadius: 8, overflow: 'hidden'}}>
                              <div style={{backgroundColor: '#f0fdf4', padding: '8px 12px', borderBottom: '1px solid #bbf7d0'}}>
                                <span style={{fontWeight: 'bold', color: '#15803d', fontSize: 13}}>🥦 VEG ITEMS</span>
                                {booking.vegPax > 0 && (
                                  <span style={{marginLeft: 8, fontSize: 11, color: '#16a34a'}}>({booking.vegPax} pax)</span>
                                )}
                              </div>
                              <div style={{padding: '12px'}}>
                                {vegEntries.length > 0
                                  ? vegEntries.map(([cat, items]) => renderCategoryBlock(cat, items))
                                  : <p style={{color: '#9ca3af', fontSize: 12}}>No veg items selected</p>}
                              </div>
                            </div>
                            {/* Non-Veg Column */}
                            <div style={{border: '1px solid #fecaca', borderRadius: 8, overflow: 'hidden'}}>
                              <div style={{backgroundColor: '#fef2f2', padding: '8px 12px', borderBottom: '1px solid #fecaca'}}>
                                <span style={{fontWeight: 'bold', color: '#dc2626', fontSize: 13}}>🍗 NON-VEG ITEMS</span>
                                {booking.nonVegPax > 0 && (
                                  <span style={{marginLeft: 8, fontSize: 11, color: '#ef4444'}}>({booking.nonVegPax} pax)</span>
                                )}
                              </div>
                              <div style={{padding: '12px'}}>
                                {nonVegEntries.length > 0
                                  ? nonVegEntries.map(([cat, items]) => renderCategoryBlock(cat, items))
                                  : <p style={{color: '#9ca3af', fontSize: 12}}>No non-veg items selected</p>}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Single food type — original 2-col grid
                      return (
                        <div className="grid grid-cols-2 gap-8">
                          {entries.map(([category, items]) => renderCategoryBlock(category, items))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChefPDFPreview;