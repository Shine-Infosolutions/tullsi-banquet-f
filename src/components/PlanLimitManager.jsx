import { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import { FiPlus, FiEdit2, FiX, FiLayers } from 'react-icons/fi';

const PlanLimitManager = () => {
  const [limits, setLimits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const fetchLimits = async () => {
    try {
      setLoading(true);
      const [limitsRes, categoriesRes] = await Promise.all([
        fetch('https://shine-banquet-hotel-backend.vercel.app/api/plan-limits/get'),
        fetch('https://shine-banquet-hotel-backend.vercel.app/api/categories/all')
      ]);
      if (limitsRes.ok) {
        const data = await limitsRes.json();
        setLimits(data.success ? data.data : []);
      }
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLimits(); }, []);

  const handleSave = async (planData) => {
    try {
      const isEditing = planData._id;
      const url = isEditing
        ? `https://shine-banquet-hotel-backend.vercel.app/api/plan-limits/${planData._id}`
        : 'https://shine-banquet-hotel-backend.vercel.app/api/plan-limits';
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData)
      });
      if (response.ok) {
        setEditingPlan(null);
        fetchLimits();
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to save plan limits');
      }
    } catch (error) {
      alert('Failed to save plan limits');
    }
  };

  const handleDelete = async (plan) => {
    try {
      const response = await fetch(`https://shine-banquet-hotel-backend.vercel.app/api/plan-limits/${plan._id}`, { method: 'DELETE' });
      if (response.ok) fetchLimits();
    } catch (error) {
      alert('Failed to delete plan');
    }
  };

  const planBadgeColor = (plan) => {
    const map = { Silver: 'bg-gray-100 text-gray-700', Gold: 'bg-yellow-100 text-yellow-700', Platinum: 'bg-purple-100 text-purple-700' };
    return map[plan] || 'bg-gray-100 text-gray-600';
  };

  const PlanEditor = ({ plan, onSave, onCancel, onDelete }) => {
    const [localCategories, setLocalCategories] = useState([]);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [formData, setFormData] = useState(() => ({
      ...(plan && Object.keys(plan).length > 0 ? plan : { ratePlan: 'Silver', foodType: 'Veg' }),
      limits: plan?.limits || {}
    }));

    useEffect(() => {
      fetch('https://shine-banquet-hotel-backend.vercel.app/api/categories/all')
        .then(r => r.ok ? r.json() : [])
        .then(data => setLocalCategories(Array.isArray(data) ? data : []))
        .catch(() => setLocalCategories([]));
    }, []);

    const handleLimitChange = (categoryId, value) => {
      setFormData(prev => ({ ...prev, limits: { ...prev.limits, [categoryId]: parseInt(value) || 0 } }));
    };

    const handleCreateCategory = async (categoryData) => {
      try {
        const response = await fetch('https://shine-banquet-hotel-backend.vercel.app/api/categories/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData)
        });
        if (response.ok) {
          setShowCategoryForm(false);
          const res = await fetch('https://shine-banquet-hotel-backend.vercel.app/api/categories/all');
          if (res.ok) setLocalCategories(await res.json());
        }
      } catch (error) {
        alert('Failed to create category');
      }
    };

    const handleDeleteCategory = async (categoryId) => {
      if (!window.confirm('Delete this category?')) return;
      try {
        const response = await fetch(`https://shine-banquet-hotel-backend.vercel.app/api/categories/delete/${categoryId}`, { method: 'DELETE' });
        if (response.ok) {
          const res = await fetch('https://shine-banquet-hotel-backend.vercel.app/api/categories/all');
          if (res.ok) setLocalCategories(await res.json());
          setFormData(prev => {
            const newLimits = { ...prev.limits };
            delete newLimits[categoryId];
            return { ...prev, limits: newLimits };
          });
        }
      } catch (error) {
        alert('Failed to delete category');
      }
    };

    const CategoryForm = ({ onSave, onCancel }) => {
      const [categoryData, setCategoryData] = useState({ cateName: '', status: 'active' });
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold" style={{ color: 'hsl(45, 100%, 20%)' }}>Add Category</h3>
              <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-100"><FiX className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Category Name</label>
                <input
                  type="text"
                  value={categoryData.cateName}
                  onChange={(e) => setCategoryData(prev => ({ ...prev, cateName: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c3ad6b] text-sm bg-gray-50"
                  placeholder="e.g. Starters"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Status</label>
                <select
                  value={categoryData.status}
                  onChange={(e) => setCategoryData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c3ad6b] text-sm bg-gray-50"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onSave(categoryData)} className="flex-1 bg-[#c3ad6b] hover:bg-[#b39b5a] text-white py-2.5 rounded-lg font-semibold text-sm transition-colors">Save</button>
              <button onClick={onCancel} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold text-sm transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
            <h3 className="text-lg font-bold" style={{ color: 'hsl(45, 100%, 20%)' }}>
              {plan && plan._id ? 'Edit' : 'Add'} Plan Limits
            </h3>
            <button onClick={onCancel} className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><FiX className="w-5 h-5 text-gray-500" /></button>
          </div>

          <div className="p-6 space-y-6">
            {/* Plan & Food Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Rate Plan</label>
                <select
                  value={formData.ratePlan}
                  onChange={(e) => setFormData(prev => ({ ...prev, ratePlan: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c3ad6b] text-sm bg-gray-50"
                >
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Food Type</label>
                <select
                  value={formData.foodType}
                  onChange={(e) => setFormData(prev => ({ ...prev, foodType: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c3ad6b] text-sm bg-gray-50"
                >
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                </select>
              </div>
            </div>

            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-gray-700">Category Limits</h4>
                <button
                  onClick={() => setShowCategoryForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c3ad6b]/10 text-[#8a7340] hover:bg-[#c3ad6b]/20 rounded-lg text-xs font-semibold transition-colors"
                >
                  <FiPlus className="w-3.5 h-3.5" /> Add Category
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {localCategories.filter(cat => cat.status === 'active').map(category => (
                  <div key={category._id} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-700 truncate">{category.cateName}</span>
                      <button onClick={() => handleDeleteCategory(category._id)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0">
                        <FaTrash size={11} />
                      </button>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={formData.limits?.[category._id] || formData.limits?.[category.cateName] || 0}
                      onChange={(e) => handleLimitChange(category._id, e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c3ad6b] bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button onClick={() => onSave(formData)} className="flex-1 bg-[#c3ad6b] hover:bg-[#b39b5a] text-white py-2.5 rounded-lg font-semibold text-sm transition-colors">
              Save Plan
            </button>
            {plan && plan._id && (
              <button
                onClick={() => { if (window.confirm(`Delete ${formData.ratePlan} - ${formData.foodType}?`)) onDelete(plan); }}
                className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-colors"
              >
                Delete
              </button>
            )}
            <button onClick={onCancel} className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold text-sm transition-colors">
              Cancel
            </button>
          </div>

          {showCategoryForm && (
            <CategoryForm onSave={handleCreateCategory} onCancel={() => setShowCategoryForm(false)} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'hsl(45, 100%, 20%)' }}>Plan Limits</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage item limits per rate plan</p>
        </div>
        <button
          onClick={() => setEditingPlan({})}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#c3ad6b] hover:bg-[#b39b5a] text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
        >
          <FiPlus className="w-4 h-4" /> Add Plan
        </button>
      </div>

      {/* Plan Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#c3ad6b]"></div>
        </div>
      ) : limits.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md py-20 text-center">
          <FiLayers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400 font-medium">No plan limits found</p>
          <p className="text-gray-400 text-sm mt-1">Click "Add Plan" to create one</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {limits.map(limit => (
            <div key={`${limit.ratePlan}-${limit.foodType}`} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Card Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#c3ad6b]/5">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${planBadgeColor(limit.ratePlan)}`}>
                    {limit.ratePlan}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${limit.foodType === 'Veg' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {limit.foodType}
                  </span>
                </div>
                <button
                  onClick={() => setEditingPlan(limit)}
                  className="p-2 rounded-lg bg-white border border-gray-200 text-[#c3ad6b] hover:bg-[#c3ad6b] hover:text-white transition-colors shadow-sm"
                >
                  <FiEdit2 size={13} />
                </button>
              </div>

              {/* Card Body */}
              <div className="px-5 py-4 space-y-2">
                {Object.entries(limit.limits || {}).map(([categoryKey, value]) => {
                  const category = categories.find(cat => cat._id === categoryKey || cat.cateName === categoryKey);
                  return (
                    <div key={categoryKey} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 truncate mr-2">{category?.cateName || categoryKey}</span>
                      <span className="text-sm font-bold text-[#c3ad6b] bg-[#c3ad6b]/10 px-2.5 py-0.5 rounded-full flex-shrink-0">{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {editingPlan && (
        <PlanEditor
          plan={editingPlan}
          onSave={handleSave}
          onCancel={() => setEditingPlan(null)}
          onDelete={(plan) => { handleDelete(plan); setEditingPlan(null); }}
        />
      )}
    </div>
  );
};

export default PlanLimitManager;
