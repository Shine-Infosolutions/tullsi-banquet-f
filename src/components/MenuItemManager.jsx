import { useState, useEffect } from 'react'
import { FaTrash, FaEdit } from 'react-icons/fa'
import { FiPlus, FiSearch, FiX } from 'react-icons/fi'
import { categoryAPI, menuItemAPI } from '../services/api'

const MenuItemManager = () => {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', category: '', foodType: '' })
  const [newItemForm, setNewItemForm] = useState({ name: '', category: '', foodType: '' })
  const [foodTypeFilter, setFoodTypeFilter] = useState('All')
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loadData = async () => {
      await fetchCategories()
      await fetchMenuItems()
    }
    loadData()
  }, [])

  const getCategoryName = (categoryId) => {
    if (!categoryId) return '—'
    if (typeof categoryId === 'object' && categoryId.cateName) return categoryId.cateName
    const category = categories.find(cat => cat._id === categoryId || cat._id?.toString() === categoryId?.toString())
    return category?.cateName || '—'
  }

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getAll()
      const data = res.data
      let categoriesData = Array.isArray(data) ? data : data.data || data.categories || []
      setCategories(categoriesData)
      return categoriesData
    } catch (error) {
      console.error('Categories fetch error:', error)
    }
    setCategories([])
    return []
  }

  const fetchMenuItems = async () => {
    setLoading(true)
    try {
      const res = await menuItemAPI.getAll()
      const data = res.data
      let items = Array.isArray(data) ? data : data.data || data.menuItems || []
      setMenuItems(items)
    } catch (error) {
      setMessage(`Connection error: ${error.message}`)
      setMenuItems([])
    }
    setLoading(false)
  }

  const fetchMenuItemsByFoodType = async (foodType) => {
    setLoading(true)
    try {
      const params = foodType !== 'All' ? `?foodType=${foodType}` : ''
      const res = await menuItemAPI.getAll(params)
      const data = res.data
      let items = Array.isArray(data) ? data : data.data || data.menuItems || []
      setMenuItems(items)
    } catch (error) {
      setMessage(`Error: ${error.message}`)
    }
    setLoading(false)
  }

  const handleEdit = (id) => {
    const item = menuItems.find(item => (item._id || item.id) === id)
    setEditingItem(id)
    const categoryId = typeof item.category === 'object' ? item.category._id : item.category
    setEditForm({ name: item.name, category: categoryId, foodType: item.foodType })
  }

  const saveEdit = async () => {
    try {
      await menuItemAPI.update(editingItem, editForm)
      setMenuItems(menuItems.map(item => (item._id || item.id) === editingItem ? { ...item, ...editForm } : item))
      setEditingItem(null)
      setMessage('Item updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Failed to update item')
    }
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setEditForm({ name: '', category: '', foodType: '' })
  }

  const addMenuItem = async () => {
    if (!newItemForm.name || !newItemForm.category || !newItemForm.foodType) {
      setMessage('Please fill all fields')
      return
    }
    try {
      await menuItemAPI.create(newItemForm)
      setNewItemForm({ name: '', category: '', foodType: '' })
      setMessage('Menu item added successfully!')
      setTimeout(() => setMessage(''), 3000)
      await fetchMenuItems()
    } catch (error) {
      setMessage('Failed to add menu item')
    }
  }

  const handleDelete = async (id) => {
    if (!id || !window.confirm('Are you sure you want to delete this item?')) return
    try {
      await menuItemAPI.delete(id)
      setMenuItems(menuItems.filter(item => (item._id || item.id) !== id))
      setMessage('Item deleted successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Failed to delete item')
    }
  }

  const foodTypeBadge = (type) => {
    const map = {
      'Veg': 'bg-green-100 text-green-700',
      'Non-Veg': 'bg-red-100 text-red-700',
      'Both': 'bg-blue-100 text-blue-700',
    }
    return map[type] || 'bg-gray-100 text-gray-600'
  }

  const filteredItems = menuItems.filter(item =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Add New Item Card */}
      <div className="bg-white rounded-xl shadow-md p-5">
        <h3 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'hsl(45, 100%, 20%)' }}>
          <FiPlus className="w-4 h-4 text-[#c3ad6b]" /> Add New Menu Item
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Item name"
            value={newItemForm.name}
            onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c3ad6b] text-sm bg-gray-50"
          />
          <select
            value={newItemForm.category}
            onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value })}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c3ad6b] text-sm bg-gray-50"
          >
            <option value="">Select Category</option>
            {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.cateName}</option>)}
          </select>
          <select
            value={newItemForm.foodType}
            onChange={(e) => setNewItemForm({ ...newItemForm, foodType: e.target.value })}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c3ad6b] text-sm bg-gray-50"
          >
            <option value="">Select Food Type</option>
            <option value="Both">Both</option>
            <option value="Veg">Veg</option>
            <option value="Non-Veg">Non-Veg</option>
          </select>
          <button
            onClick={addMenuItem}
            className="px-4 py-2.5 bg-[#c3ad6b] hover:bg-[#b39b5a] text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <FiPlus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between ${
          message.includes('Error') || message.includes('Failed') || message.includes('failed')
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
          <button onClick={() => setMessage('')}><FiX className="w-4 h-4" /></button>
        </div>
      )}

      {/* Items Table Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-base font-bold" style={{ color: 'hsl(45, 100%, 20%)' }}>
            Menu Items <span className="text-[#c3ad6b]">({filteredItems.length})</span>
          </h3>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c3ad6b] bg-gray-50 w-full sm:w-48"
              />
            </div>
            <select
              value={foodTypeFilter}
              onChange={(e) => { setFoodTypeFilter(e.target.value); fetchMenuItemsByFoodType(e.target.value) }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c3ad6b] bg-gray-50"
            >
              <option value="All">All</option>
              <option value="Veg">Veg</option>
              <option value="Non-Veg">Non-Veg</option>
              <option value="Both">Both</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#c3ad6b]"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <FiSearch className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No menu items found</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="block sm:hidden space-y-3 p-4">
              {filteredItems.map((item) => (
                <div key={item._id || item.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                  {editingItem === (item._id || item.id) ? (
                    <div className="space-y-3">
                      <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c3ad6b]" placeholder="Item Name" />
                      <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c3ad6b]">
                        <option value="">Select Category</option>
                        {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.cateName}</option>)}
                      </select>
                      <select value={editForm.foodType} onChange={(e) => setEditForm({ ...editForm, foodType: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c3ad6b]">
                        <option value="Both">Both</option>
                        <option value="Veg">Veg</option>
                        <option value="Non-Veg">Non-Veg</option>
                      </select>
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="flex-1 bg-[#c3ad6b] text-white py-2 rounded-lg text-sm font-semibold">Save</button>
                        <button onClick={cancelEdit} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-semibold">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{getCategoryName(item.category)}</p>
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${foodTypeBadge(item.foodType)}`}>{item.foodType || 'Both'}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(item._id || item.id)} className="p-2 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"><FaEdit size={13} /></button>
                        <button onClick={() => handleDelete(item._id || item.id)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"><FaTrash size={13} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#c3ad6b]/10 border-b border-[#c3ad6b]/20">
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#8a7340]">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#8a7340]">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#8a7340]">Food Type</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#8a7340]">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#8a7340]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map((item, idx) => (
                    <tr key={item._id || item.id} className={idx % 2 === 0 ? 'bg-white hover:bg-[#c3ad6b]/5 transition-colors' : 'bg-gray-50/50 hover:bg-[#c3ad6b]/5 transition-colors'}>
                      {editingItem === (item._id || item.id) ? (
                        <>
                          <td className="px-6 py-3"><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c3ad6b]" /></td>
                          <td className="px-6 py-3"><select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c3ad6b]"><option value="">Select</option>{categories.map(cat => <option key={cat._id} value={cat._id}>{cat.cateName}</option>)}</select></td>
                          <td className="px-6 py-3"><select value={editForm.foodType} onChange={(e) => setEditForm({ ...editForm, foodType: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c3ad6b]"><option value="Both">Both</option><option value="Veg">Veg</option><option value="Non-Veg">Non-Veg</option></select></td>
                          <td className="px-6 py-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span></td>
                          <td className="px-6 py-3">
                            <button onClick={saveEdit} className="px-3 py-1.5 bg-[#c3ad6b] text-white rounded-lg text-xs font-semibold mr-2 hover:bg-[#b39b5a]">Save</button>
                            <button onClick={cancelEdit} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-300">Cancel</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-3 font-medium text-gray-800">{item.name}</td>
                          <td className="px-6 py-3 text-gray-600">{getCategoryName(item.category)}</td>
                          <td className="px-6 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${foodTypeBadge(item.foodType)}`}>{item.foodType || 'Both'}</span></td>
                          <td className="px-6 py-3"><span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Active</span></td>
                          <td className="px-6 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => handleEdit(item._id || item.id)} className="p-2 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"><FaEdit size={13} /></button>
                              <button onClick={() => handleDelete(item._id || item.id)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"><FaTrash size={13} /></button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MenuItemManager
