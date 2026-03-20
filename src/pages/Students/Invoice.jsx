import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { bookingAPI, menuAPI, menuItemAPI } from '../../services/api';
import { useReactToPrint } from "react-to-print";
import Logo from "../../assets/tulsiblack.png";
import WaterMark from "../../assets/tulsiblack.png";


import { useNavigate } from "react-router-dom";

const Invoice = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [menuData, setMenuData] = useState(null);
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [invoiceType, setInvoiceType] = useState('Veg'); // 'Veg' or 'Non-Veg'
  const printRef = useRef();
  const navigate = useNavigate();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice_${booking?.name}_${booking?.startDate}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0.5in;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .print\\:hidden { display: none !important; }
        * { print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
        .print\\:text-lg { font-size: 1.125rem !important; }
        .print\\:text-sm { font-size: 0.875rem !important; }
        .print\\:text-xs { font-size: 0.75rem !important; }
        .print\\:leading-tight { line-height: 1.25 !important; }
        .watermark-container::before {
          content: '' !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background-image: url('${WaterMark}') !important;
          background-size: 80% !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
          opacity: 0.3 !important;
          z-index: 1 !important;
          pointer-events: none !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .watermark-content {
          position: relative !important;
          z-index: 2 !important;
        }
      }
    `
  });

  const fetchMenuData = async (bookingId) => {
    try {
      const response = await menuAPI.getByBookingId(bookingId);
      const raw = response.data?.data || response.data;
      const categories = raw?.categories || raw;
      if (categories && typeof categories === 'object') setMenuData(categories);
    } catch {
      // no menu found
    }
  };

  const fetchAllMenuItems = async () => {
    try {
      const response = await menuItemAPI.getAll();
      const items = response.data?.data || response.data || [];
      setAllMenuItems(Array.isArray(items) ? items : []);
    } catch {
      // ignore
    }
  };

  const handleShare = () => {
    const message = `Hi ${booking.name}, here is your booking invoice from Tulsi Banquet. Please use Ctrl+P (or Cmd+P on Mac) to print/save as PDF, then share the PDF file.`;
    const whatsappUrl = `https://wa.me/${booking.whatsapp || booking.number}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Trigger print dialog
    setTimeout(() => {
      window.print();
    }, 500);
  };

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await bookingAPI.getById(id);
        const bookingData = response.data?.data || response.data;
        if (!bookingData) throw new Error('Booking not found');
        setBooking(bookingData);
        await Promise.all([fetchMenuData(id), fetchAllMenuItems()]);
      } catch (error) {
        console.error('Fetch error:', error);
        setError("Failed to load booking details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBooking();
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f7f5ef] to-[#c3ad6b]/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c3ad6b] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading invoice...</p>
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

  if (!booking)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 to-[#c3ad6b]/30">
        <div className="bg-yellow-100 border-l-4 border-[#c3ad6b] text-[#c3ad6b] p-4 max-w-md rounded shadow">
          <p className="font-bold">Not Found</p>
          <p>No booking found with this ID.</p>
        </div>
      </div>
    );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-[#c3ad6b]/20 text-[#c3ad6b] rounded hover:bg-[#c3ad6b]/40 font-semibold shadow print:hidden"
      >
        ← Back
      </button>

      <div className="max-w-4xl mx-auto">
        {booking.foodType === 'Both' && (
          <div className="flex justify-center mb-4 print:hidden">
            <div className="inline-flex rounded-lg border-2 border-[#c3ad6b] overflow-hidden">
              <button
                onClick={() => setInvoiceType('Veg')}
                className={`px-6 py-2 font-semibold transition-colors ${
                  invoiceType === 'Veg'
                    ? 'bg-[#c3ad6b] text-white'
                    : 'bg-white text-[#c3ad6b] hover:bg-[#c3ad6b]/10'
                }`}
              >
                🥦 Veg Invoice
              </button>
              <button
                onClick={() => setInvoiceType('Non-Veg')}
                className={`px-6 py-2 font-semibold transition-colors border-l-2 border-[#c3ad6b] ${
                  invoiceType === 'Non-Veg'
                    ? 'bg-[#c3ad6b] text-white'
                    : 'bg-white text-[#c3ad6b] hover:bg-[#c3ad6b]/10'
                }`}
              >
                🍗 Non-Veg Invoice
              </button>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 mb-4 print:hidden">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors font-semibold"
          >
            📱 Share on WhatsApp
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#c3ad6b] text-white rounded-lg shadow hover:bg-[#b39b5a] transition-colors font-semibold"
          >
            🖨️ Print Invoice
          </button>
        </div>

        <div
          ref={printRef}
          className="watermark-container bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none print:rounded-none print:max-w-none print:m-0 print:p-4 print:text-xs print:leading-tight relative"
          style={{
            backgroundImage: `url(${WaterMark})`,
            backgroundSize: '80%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-white/60 print:bg-white/60 pointer-events-none"></div>
          <div className="watermark-content relative z-10">
          {/* Header */}
          <div className="bg-[#f7f5ef] px-8 py-6 print:bg-white print:px-2 print:py-3 print:border-b print:border-gray-300">
            <div className="flex items-center justify-between print:flex-row">
              <div className="flex flex-col items-center space-y-2 print:space-y-1">
                <img
                  src={Logo}
                  alt="Hotel Logo"
                  className="w-24 h-24 object-contain rounded-lg print:w-20 print:h-20 print:rounded-none"
                />
                <p className="text-gray-600 text-center print:text-sm print:text-black">Booking Invoice</p>
              </div>
              <div className="text-right print:text-right">
                <p className="text-sm text-gray-600 print:text-xs print:text-black">Invoice Date</p>
                <p className="font-semibold print:text-sm print:text-black">{formatDate(new Date())}</p>
              </div>
            </div>
          </div>

          {/* Invoice Content */}
          <div className="px-8 py-6 print:px-2 print:py-3">
            {/* Customer & Booking Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 print:grid-cols-3 print:gap-4 print:mb-2">
              {/* Customer Details */}
              <div className="md:col-span-1 print:col-span-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2 print:text-xs print:text-black print:mb-1 print:pb-0 print:font-bold">
                  Customer Details
                </h3>
                <div className="space-y-2 print:space-y-0 print:text-xs print:text-black">
                  <p><span className="font-medium">Name:</span> {booking.name}</p>
                  <p><span className="font-medium">Mobile:</span> {booking.phone || booking.number}</p>
                  {booking.email && <p><span className="font-medium">Email:</span> {booking.email}</p>}
                  {booking.whatsapp && <p><span className="font-medium">WhatsApp:</span> {booking.whatsapp}</p>}
                  {(booking.gst && booking.gst !== '' && booking.gst !== 0 && Number(booking.gst) > 0) ? <p><span className="font-medium">GST:</span> {booking.gst}%</p> : null}
                </div>
              </div>

              {/* Empty space */}
              <div className="hidden md:block print:block"></div>

              {/* Booking Details */}
              <div className="md:col-span-1 print:col-span-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2 print:text-xs print:text-black print:mb-1 print:pb-0 print:font-bold">
                  Booking Details
                </h3>
                <div className="space-y-2 print:space-y-0 print:text-xs print:text-black">
                  <p><span className="font-medium">Date:</span> {formatDate(booking.startDate)}</p>
                  <p><span className="font-medium">Time:</span> {booking.time}</p>
                  <p><span className="font-medium">Hall:</span> {booking.hall}</p>
                  <p><span className="font-medium">Guests:</span> {booking.foodType === 'Both' ? (invoiceType === 'Veg' ? `${booking.vegPax} pax (Veg)` : `${booking.nonVegPax} pax (Non-Veg)`) : `${booking.pax} pax`}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold print:bg-transparent print:text-black print:px-0 print:py-0 ${
                      booking.bookingStatus === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      booking.bookingStatus === 'Tentative' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.bookingStatus}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="mb-8 print:mb-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4  pb-2 print:text-xs print:text-black print:mb-1 print:pb-0 print:font-bold">
                Terms & Conditions
              </h3>
              <div className="rounded-lg p-4  print:p-2">
                <ul className="text-sm text-gray-700 space-y-1 print:text-xs print:text-black print:space-y-0">
                  <li>• Lunch timing will be from 10 AM - 4PM and Dinner timing will be from 6PM - 11PM.</li>
                  <li>• Advance is Non-refundable & Non-transferable.</li>
                  <li>• Booking rate once finalized will not be changed at the time of final payment.</li>
                  <li>• Loud music will not be allowed after 11PM.</li>
                  <li>• 50% advance payment required at the time of booking.</li>
                  <li>• LCD Projector will be charged Rs4000 Only.</li>
                  <li>• Mike & Sound system will be provided for Rs3000 Only.</li>
                </ul>
              </div>
            </div>

            {/* Package Details */}
            <div className="mb-8 print:mb-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 print:text-xs print:text-black print:mb-1 print:pb-0 print:font-bold">
                Package Details
              </h3>
              <div className=" rounded-lg p-4  print:p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-4 print:items-start">
                  <div>
                    <p className="font-medium text-gray-600 print:text-xs print:text-black">Rate Plan</p>
                    <p className="text-lg font-semibold text-[#c3ad6b] print:text-xs print:text-black">{booking.ratePlan}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600 print:text-xs print:text-black">Rate per Pax</p>
                    <p className="text-lg font-semibold text-[#c3ad6b] print:text-xs print:text-black">₹{
                      booking.foodType === 'Both'
                        ? (invoiceType === 'Veg' ? (booking.vegRate || 0) : (booking.nonVegRate || 0))
                        : booking.ratePerPax
                    }</p>
                  </div>
                </div>
                <div className="mt-4 print:mt-1">
                  <p className="font-medium text-gray-600 mb-3 print:text-xs print:text-black print:mb-1 print:font-bold">Selected Menu Items ({booking.foodType === 'Both' ? invoiceType : booking.foodType})</p>
                  {(() => {
                    const cm = booking.categorizedMenu;
                    const displayMenuData = menuData || (cm?.categories ?? cm);
                    const skip = ['_id', 'bookingRef', 'customerRef', 'createdAt', 'updatedAt', '__v'];

                    // Build a lookup: itemName -> foodType using allMenuItems from DB
                    const itemFoodTypeMap = {};
                    allMenuItems.forEach(item => {
                      const name = item.name || item.itemName;
                      if (name) itemFoodTypeMap[name] = item.foodType || 'Veg';
                    });

                    const shouldShowInInvoice = (itemName, invoiceType) => {
                      const ft = itemFoodTypeMap[itemName];
                      // Items with foodType 'Both' appear in both invoices
                      if (ft === 'Both') return true;
                      // Otherwise match the invoice type
                      if (invoiceType === 'Veg') return ft === 'Veg';
                      if (invoiceType === 'Non-Veg') return ft === 'Non-Veg';
                      return true;
                    };

                    if (!displayMenuData || typeof displayMenuData !== 'object' || Object.keys(displayMenuData).length === 0) {
                      return booking.menuItems
                        ? <div className="text-sm text-gray-600 print:text-xs print:text-black">{booking.menuItems}</div>
                        : <span className="text-gray-500 text-sm italic">No menu items selected</span>;
                    }

                    const entries = Object.entries(displayMenuData).filter(([k, v]) => !skip.includes(k) && Array.isArray(v) && v.length > 0);

                    if (booking.foodType === 'Both') {
                      // Split each category's items by their individual foodType
                      const filteredEntries = entries.map(([category, items]) => {
                        const filtered = items.filter(item => shouldShowInInvoice(item, invoiceType));
                        return [category, filtered];
                      }).filter(([, items]) => items.length > 0);

                      if (filteredEntries.length === 0) {
                        return (
                          <div className="text-center py-8 text-gray-400 text-sm italic">
                            No {invoiceType} items found in menu
                          </div>
                        );
                      }
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-2 print:gap-2">
                          {filteredEntries.map(([category, items]) => (
                            <div key={category} className="p-2 print:p-1">
                              <h4 className="font-medium mb-1 text-xs print:mb-0 print:font-bold" style={{color:'#c3ad6b'}}>
                                {category.replaceAll('_',' ')}
                              </h4>
                              <div className="text-xs text-gray-600 print:text-black">
                                {items.map((item, i) => (
                                  <span key={item}>
                                    {i > 0 && ', '}
                                    {item}
                                    {itemFoodTypeMap[item] === 'Both' && (
                                      <span className="ml-1 text-[10px] font-semibold text-[#c3ad6b] print:text-gray-500">(common)</span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-2 print:gap-2">
                        {entries.map(([category, items]) => (
                          <div key={category} className="p-2 print:p-1">
                            <h4 className="font-medium text-[#c3ad6b] mb-1 text-xs print:text-black print:mb-0 print:font-bold">
                              {category.replaceAll('_',' ')}
                            </h4>
                            <div className="text-xs text-gray-600 print:text-black">{items.join(', ')}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>


            {/* Room Details */}
            {booking.complimentaryRooms > 0 && (
              <div className="mb-8 print:mb-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2 print:text-xs print:text-black print:mb-1 print:pb-0 print:font-bold">
                  Room Details
                </h3>
                <div className="bg-green-50 rounded-lg p-4 print:bg-white print:p-2 print:text-xs print:text-black">
                  <p><span className="font-medium">Complimentary Rooms:</span> {booking.complimentaryRooms} (FREE)</p>
                  {booking.extraRooms > 0 && (
                    <>
                      <p><span className="font-medium">Additional Rooms:</span> {booking.extraRooms}</p>
                      <p><span className="font-medium">Room Price:</span> ₹{booking.roomPricePerUnit} per room</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="mb-8 print:mb-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2 print:text-xs print:text-black print:mb-1 print:pb-0 print:font-bold">
                Payment Summary
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 print:bg-white print:p-2 print:border print:border-gray-300">
                <div className="space-y-3 print:space-y-1 print:text-xs print:text-black">
                  {booking.foodType === 'Both' ? (
                    invoiceType === 'Veg' ? (
                      <div className="flex justify-between text-green-700">
                        <span>🥦 Veg ({booking.vegPax} pax × ₹{booking.vegRate || booking.ratePerPax})</span>
                        <span>₹{((booking.vegPax) * (booking.vegRate || 0)).toFixed(2)}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-red-600">
                        <span>🍗 Non-Veg ({booking.nonVegPax} pax × ₹{booking.nonVegRate || booking.ratePerPax})</span>
                        <span>₹{((booking.nonVegPax) * (booking.nonVegRate || 0)).toFixed(2)}</span>
                      </div>
                    )
                  ) : (
                    <div className="flex justify-between">
                      <span>Subtotal ({booking.pax} pax × ₹{booking.ratePerPax})</span>
                      <span>₹{(booking.pax * booking.ratePerPax).toFixed(2)}</span>
                    </div>
                  )}
                  {booking.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({booking.discount}%)</span>
                      <span>-₹{(() => {
                        const subtotal = booking.pax * booking.ratePerPax;
                        const discountAmount = (subtotal * booking.discount) / 100;
                        return discountAmount.toFixed(2);
                      })()}</span>
                    </div>
                  )}
                  {booking.decorationCharge > 0 && (
                    <div className="flex justify-between">
                      <span>Decoration Charge</span>
                      <span>₹{booking.decorationCharge}</span>
                    </div>
                  )}
                  {booking.musicCharge > 0 && (
                    <div className="flex justify-between">
                      <span>Music Charge</span>
                      <span>₹{booking.musicCharge}</span>
                    </div>
                  )}
                  {booking.extraRoomTotalPrice > 0 && (
                    <div className="flex justify-between">
                      <span>Additional Rooms</span>
                      <span>₹{booking.extraRoomTotalPrice}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Amount</span>
                      <span className="text-[#c3ad6b]">₹{(() => {
                        if (booking.foodType === 'Both') {
                          const subtotal = invoiceType === 'Veg' 
                            ? (booking.vegPax * (booking.vegRate || 0))
                            : (booking.nonVegPax * (booking.nonVegRate || 0));
                          const discountAmount = booking.discount > 0 ? (subtotal * booking.discount) / 100 : 0;
                          const afterDiscount = subtotal - discountAmount;
                          const proportion = invoiceType === 'Veg' 
                            ? (booking.vegPax / booking.pax) 
                            : (booking.nonVegPax / booking.pax);
                          const extraCharges = ((booking.decorationCharge || 0) + (booking.musicCharge || 0) + (booking.extraRoomTotalPrice || 0)) * proportion;
                          return (afterDiscount + extraCharges).toFixed(2);
                        }
                        return booking.total;
                      })()}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Advance Paid</span>
                      <span>₹{(() => {
                        const totalAdvance = Array.isArray(booking.advance) ? booking.advance.reduce((sum, adv) => sum + (adv.amount || 0), 0) : (booking.advance || 0);
                        if (booking.foodType === 'Both') {
                          const proportion = invoiceType === 'Veg' 
                            ? (booking.vegPax / booking.pax) 
                            : (booking.nonVegPax / booking.pax);
                          return (totalAdvance * proportion).toFixed(2);
                        }
                        return totalAdvance;
                      })()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-red-600">
                      <span>Balance Due</span>
                      <span>₹{(() => {
                        if (booking.foodType === 'Both') {
                          const subtotal = invoiceType === 'Veg' 
                            ? (booking.vegPax * (booking.vegRate || 0))
                            : (booking.nonVegPax * (booking.nonVegRate || 0));
                          const discountAmount = booking.discount > 0 ? (subtotal * booking.discount) / 100 : 0;
                          const afterDiscount = subtotal - discountAmount;
                          const proportion = invoiceType === 'Veg' 
                            ? (booking.vegPax / booking.pax) 
                            : (booking.nonVegPax / booking.pax);
                          const extraCharges = ((booking.decorationCharge || 0) + (booking.musicCharge || 0) + (booking.extraRoomTotalPrice || 0)) * proportion;
                          const total = afterDiscount + extraCharges;
                          const totalAdvance = Array.isArray(booking.advance) ? booking.advance.reduce((sum, adv) => sum + (adv.amount || 0), 0) : (booking.advance || 0);
                          const advance = totalAdvance * proportion;
                          return (total - advance).toFixed(2);
                        }
                        return booking.balance || 0;
                      })()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {booking.notes && (
              <div className="mb-8 print:mb-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2 print:text-xs print:text-black print:mb-1 print:pb-0 print:font-bold">
                  Special Notes
                </h3>
                <div className="bg-blue-50 rounded-lg p-4 print:bg-white print:p-2 print:text-xs print:text-black">
                  <p className="text-gray-700 print:text-black">{booking.notes}</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-600 print:pt-3 print:text-xs print:text-black">
              <p className="mb-2 print:mb-0">Thank you for choosing Tulsi Banquet!</p>
              <p className="print:hidden">For any queries, please contact us at your convenience.</p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;