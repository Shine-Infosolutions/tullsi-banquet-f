import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiLayers } from 'react-icons/fi';
import MenuItemManager from './MenuItemManager';
import PlanLimitManager from './PlanLimitManager';
import DashboardLoader from '../DashboardLoader';

const MenuPlanManager = ({ setSidebarOpen }) => {
  const [activeTab, setActiveTab] = useState('menu');
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (pageLoading) return <DashboardLoader pageName="Menu & Plans" />;

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: 'hsl(45, 100%, 95%)' }}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 w-full">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen && setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-[#c3ad6b] text-white hover:bg-[#b39b5a] transition-colors"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <h1 className="text-xl lg:text-2xl font-bold" style={{ color: 'hsl(45, 100%, 20%)' }}>
              Menu & Plans
            </h1>
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Switcher */}
        <div className="bg-white rounded-xl shadow-md p-1.5 flex gap-1 mb-6 w-fit">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeTab === 'menu'
                ? 'bg-[#c3ad6b] text-white shadow'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <FiMenu className="w-4 h-4" />
            Menu Items
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeTab === 'plans'
                ? 'bg-[#c3ad6b] text-white shadow'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <FiLayers className="w-4 h-4" />
            Plan Limits
          </button>
        </div>

        <div>
          {activeTab === 'menu' && <MenuItemManager />}
          {activeTab === 'plans' && <PlanLimitManager />}
        </div>
      </main>
    </div>
  );
};

export default MenuPlanManager;
