import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiX, FiPackage } from 'react-icons/fi';
import { FaRupeeSign, FaLeaf, FaDrumstickBite, FaTrash } from 'react-icons/fa';
import { planLimitAPI } from '../services/api';

const PLAN_ORDER = ['Silver', 'Gold', 'Platinum'];

const planStyle = {
  Silver: { badge: 'bg-gray-100 text-gray-700 border-gray-300', ring: 'ring-gray-300', header: 'from-gray-100 to-gray-50' },
  Gold: { badge: 'bg-yellow-100 text-yellow-700 border-yellow-300', ring: 'ring-yellow-300', header: 'from-yellow-50 to-amber-50' },
  Platinum: { badge: 'bg-purple-100 text-purple-700 border-purple-300', ring: 'ring-purple-300', header: 'from-purple-50 to-indigo-50' },
};

const PackagePlanManager = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await planLimitAPI.getAll();
      setPlans(res.data?.success ? res.data.data : []);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  // Group plans by ratePlan
  const grouped = PLAN_ORDER.reduce((acc, plan) => {
    acc[plan] = plans.filter(p => p.ratePlan === plan);
    return acc;
  }, {});

  const handleSave = async (data) => {
    try {
      const { _id, createdAt, updatedAt, __v, ...clean } = data;
      await planLimitAPI.upsert(clean);
      setEditingPlan(null);
      fetchPlans();
    } catch {
      alert('Failed to save package plan');
    }
  };

  const handleDelete = async (plan) => {
    if (!window.confirm(`Delete ${plan.ratePlan} - ${plan.foodType}?`)) return;
    try {
      await planLimitAPI.delete(plan._id);
      fetchPlans();
    } catch {
      alert('Failed to delete plan');
    }
  };

  const PlanEditor = ({ plan, onSave, onCancel }) => {
    const [form, setForm] = useState({
      ratePlan: plan?.ratePlan || 'Silver',
      foodType: plan?.foodType || 'Veg',
      price: plan?.price || '',
      limits: plan?.limits || {},
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold" style={{ color: 'hsl(45, 100%, 20%)' }}>
              {plan?._id ? 'Edit' : 'Add'} Package Plan
            </h3>
            <button onClick={onCancel} className="p-2 rounded-lg hover:bg-gray-100">
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Rate Plan</label>
                <select
                  value={form.ratePlan}
                  onChange={e => setForm(p => ({ ...p, ratePlan: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c3ad6b] text-sm bg-gray-50"
                >
                  {PLAN_ORDER.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Food Type</label>
                <select
                  value={form.foodType}
                  onChange={e => setForm(p => ({ ...p, foodType: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c3ad6b] text-sm bg-gray-50"
                >
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Price per Plate (₹)</label>
              <div className="relative">
                <FaRupeeSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                  className="pl-8 w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c3ad6b] text-sm bg-gray-50"
                  placeholder="e.g. 1250"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button
              onClick={() => onSave({ ...plan, ...form, price: parseFloat(form.price) || 0 })}
              className="flex-1 bg-[#c3ad6b] hover:bg-[#b39b5a] text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'hsl(45, 100%, 20%)' }}>Package Plans</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage pricing for each plan & food type</p>
        </div>
        <button
          onClick={() => setEditingPlan({})}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#c3ad6b] hover:bg-[#b39b5a] text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
        >
          <FiPlus className="w-4 h-4" /> Add Package
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#c3ad6b]"></div>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md py-20 text-center">
          <FiPackage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400 font-medium">No packages found</p>
          <p className="text-gray-400 text-sm mt-1">Click "Add Package" to create one</p>
        </div>
      ) : (
        <div className="space-y-8">
          {PLAN_ORDER.map(planName => {
            const planItems = grouped[planName];
            if (!planItems?.length) return null;
            const style = planStyle[planName];
            return (
              <div key={planName}>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold border ${style.badge}`}>{planName}</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {planItems.map(plan => (
                    <div
                      key={plan._id}
                      className={`bg-white rounded-2xl shadow-md overflow-hidden ring-1 ${style.ring} hover:shadow-lg transition-shadow`}
                    >
                      {/* Card Header */}
                      <div className={`bg-gradient-to-r ${style.header} px-5 py-4 flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                          {plan.foodType === 'Veg' ? (
                            <FaLeaf className="text-green-600 text-lg" />
                          ) : (
                            <FaDrumstickBite className="text-red-500 text-lg" />
                          )}
                          <span className="font-bold text-gray-800 text-base">{plan.foodType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingPlan(plan)}
                            className="p-1.5 rounded-lg bg-white border border-gray-200 text-[#c3ad6b] hover:bg-[#c3ad6b] hover:text-white transition-colors"
                          >
                            <FiEdit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(plan)}
                            className="p-1.5 rounded-lg bg-white border border-gray-200 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                          >
                            <FaTrash size={11} />
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="px-5 py-5 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Price per Plate</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-extrabold text-[#c3ad6b]">
                              {plan.price ? `₹${plan.price.toLocaleString('en-IN')}` : <span className="text-gray-300 text-xl">Not set</span>}
                            </span>
                            {plan.price > 0 && <span className="text-sm text-gray-400">/ pax</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">Category Limits</p>
                          <span className="text-2xl font-bold text-gray-700">
                            {Object.keys(plan.limits || {}).length}
                          </span>
                          <p className="text-xs text-gray-400">categories</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editingPlan !== null && (
        <PlanEditor
          plan={editingPlan}
          onSave={handleSave}
          onCancel={() => setEditingPlan(null)}
        />
      )}
    </div>
  );
};

export default PackagePlanManager;
