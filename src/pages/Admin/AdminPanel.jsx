import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import MenuItemManager from '../../components/MenuItemManager';
import PlanLimitManager from '../../components/PlanLimitManager';
import useWebSocket from '../../hooks/useWebSocket';
import { FaWifi } from 'react-icons/fa';
import { MdSignalWifiOff } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('menu-items');
  const [initializing, setInitializing] = useState(false);
  const [realtimeActivity, setRealtimeActivity] = useState([]);

  // WebSocket connection for real-time monitoring
  const { lastMessage, readyState } = useWebSocket();

  // Handle real-time messages
  useEffect(() => {
    if (lastMessage) {
      const activity = {
        id: Date.now(),
        type: lastMessage.type,
        data: lastMessage.data,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setRealtimeActivity(prev => [activity, ...prev.slice(0, 9)]); // Keep last 10 activities
      
      // Show toast notifications for admin
      switch (lastMessage.type) {
        case 'BOOKING_CREATED':
          toast.success(`📋 New booking: ${lastMessage.data.name}`);
          break;
        case 'BOOKING_UPDATED':
          toast.success(`✏️ Booking updated: ${lastMessage.data.name}`);
          break;
        case 'BOOKING_DELETED':
          toast.success(`🗑️ Booking deleted`);
          break;
        default:
          break;
      }
    }
  }, [lastMessage]);

  const initializeDefaults = async () => {
    try {
      setInitializing(true);
      const response = await axios.post('https://tulsi-banquet-backend.vercel.app/api/plan-limits/initialize');
      if (response.data.success) {
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to initialize defaults');
    } finally {
      setInitializing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex flex-wrap gap-2 sm:gap-4 lg:gap-8">
            {['menu-items', 'plan-limits', 'realtime-monitor'].map((tab, i) => (
              <motion.button
                key={tab}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-[#c3ad6b] text-[#8a7340]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'menu-items' ? 'Menu Items' : tab === 'plan-limits' ? 'Plan Limits' : 'Real-time Monitor'}
              </motion.button>
            ))}
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                {readyState === 1 ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <FaWifi className="text-sm" />
                    <span className="text-xs font-medium">Live</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <MdSignalWifiOff className="text-sm" />
                    <span className="text-xs font-medium">Offline</span>
                  </div>
                )}
              </div>
              <button
                onClick={initializeDefaults}
                disabled={initializing}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium transition-colors text-sm"
              >
                {initializing ? 'Initializing...' : 'Initialize Default Limits'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
        {activeTab === 'menu-items' && <MenuItemManager />}
        {activeTab === 'plan-limits' && <PlanLimitManager />}
        {activeTab === 'realtime-monitor' && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Real-time Activity Monitor</h2>
            <div className="space-y-3">
              {realtimeActivity.length === 0 ? (
                <p className="text-sm sm:text-base text-gray-500 italic">No recent activity</p>
              ) : (
                realtimeActivity.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        activity.type === 'BOOKING_CREATED' ? 'bg-green-500' :
                        activity.type === 'BOOKING_UPDATED' ? 'bg-blue-500' :
                        activity.type === 'BOOKING_DELETED' ? 'bg-red-500' : 'bg-gray-500'
                      }`}></div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base">
                          {activity.type === 'BOOKING_CREATED' && '📋 New Booking Created'}
                          {activity.type === 'BOOKING_UPDATED' && '✏️ Booking Updated'}
                          {activity.type === 'BOOKING_DELETED' && '🗑️ Booking Deleted'}
                        </p>
                        {activity.data && (
                          <p className="text-xs sm:text-sm text-gray-600 break-words">
                            {activity.data.name && `Customer: ${activity.data.name}`}
                            {activity.data.bookingStatus && ` | Status: ${activity.data.bookingStatus}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">{activity.timestamp}</span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AdminPanel;
